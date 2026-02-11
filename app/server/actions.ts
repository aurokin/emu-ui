import fs from "node:fs/promises";
import path from "node:path";
import type {
    EmuDevice,
    EmuServer,
    SyncPair,
    DeviceSyncRequest,
} from "./types";
import { EmuOs, Emulator, SyncAction } from "./types";
import {
    buildScpCommand,
    buildSshCommand,
    createCmd,
    pushPairs,
    pullPairs,
} from "./backup";
import { getManageFn } from "./emulator_managers";

const DOLPHIN_ANDROID_BASE_ZIP = "dolphin-emu.zip";
const DOLPHIN_ANDROID_EXPORT_ZIP = "dolphin-export.zip";
const DOLPHIN_ANDROID_DIR = "dolphin_emu";
const DOLPHIN_ANDROID_SCAN_MAX_DEPTH = 12;
const DOLPHIN_ANDROID_SCAN_MAX_DIRS = 10000;

const getDolphinAndroidPaths = (serverInfo: EmuServer) => {
    const workDir = serverInfo.workDir;
    const extractDir = path.posix.join(workDir, DOLPHIN_ANDROID_DIR);
    const baseZipPath = path.posix.join(workDir, DOLPHIN_ANDROID_BASE_ZIP);
    const exportZipPath = path.posix.join(workDir, DOLPHIN_ANDROID_EXPORT_ZIP);
    return {
        workDir,
        extractDir,
        baseZipPath,
        exportZipPath,
        gcPath: path.posix.join(extractDir, "GC"),
        wiiPath: path.posix.join(extractDir, "Wii"),
    };
};

const resolveDolphinAndroidDataPaths = async (rootPath: string) => {
    const gcPath = path.posix.join(rootPath, "GC");
    const wiiPath = path.posix.join(rootPath, "Wii");
    const [gcStats, wiiStats] = await Promise.all([
        fs.stat(gcPath).catch(() => undefined),
        fs.stat(wiiPath).catch(() => undefined),
    ]);
    if (gcStats?.isDirectory() && wiiStats?.isDirectory()) {
        return { rootPath, gcPath, wiiPath };
    }

    const entries = await fs
        .readdir(rootPath, { withFileTypes: true })
        .catch(() => []);
    const gcEntry = entries.find(
        (entry) => entry.isDirectory() && entry.name.toLowerCase() === "gc",
    );
    const wiiEntry = entries.find(
        (entry) => entry.isDirectory() && entry.name.toLowerCase() === "wii",
    );
    if (!gcEntry || !wiiEntry) {
        return undefined;
    }

    return {
        rootPath,
        gcPath: path.posix.join(rootPath, gcEntry.name),
        wiiPath: path.posix.join(rootPath, wiiEntry.name),
    };
};

const ensureDolphinAndroidData = async (extractDir: string) => {
    const queue: Array<{ rootPath: string; depth: number }> = [
        { rootPath: extractDir, depth: 0 },
    ];
    let scannedDirs = 0;

    while (queue.length > 0) {
        const current = queue.pop();
        if (!current) {
            continue;
        }

        const rootData = await resolveDolphinAndroidDataPaths(current.rootPath);
        if (rootData) {
            return rootData;
        }

        if (current.depth >= DOLPHIN_ANDROID_SCAN_MAX_DEPTH) {
            continue;
        }

        const entries = await fs
            .readdir(current.rootPath, { withFileTypes: true })
            .catch(() => []);
        for (const entry of entries) {
            const entryNameLower = entry.name.toLowerCase();
            if (
                !entry.isDirectory() ||
                entryNameLower === "gc" ||
                entryNameLower === "wii"
            ) {
                continue;
            }
            queue.push({
                rootPath: path.posix.join(current.rootPath, entry.name),
                depth: current.depth + 1,
            });
            scannedDirs += 1;
            if (scannedDirs >= DOLPHIN_ANDROID_SCAN_MAX_DIRS) {
                break;
            }
        }

        if (scannedDirs >= DOLPHIN_ANDROID_SCAN_MAX_DIRS) {
            break;
        }
    }

    throw new Error("Dolphin zip missing GC/Wii data");
};

const extractDolphinAndroidData = async (
    zipPath: string,
    extractDir: string,
    jobId?: string,
) => {
    const fixedZipPath = `${zipPath}.fixed`;

    const extractAndResolve = async (sourceZipPath: string) => {
        await createCmd(`rm -rf "${extractDir}"`, false, jobId);
        await createCmd(`mkdir -p "${extractDir}"`, false, jobId);
        await createCmd(
            `unzip -o "${sourceZipPath}" -d "${extractDir}"`,
            false,
            jobId,
        );
        return ensureDolphinAndroidData(extractDir);
    };

    try {
        const dataPaths = await extractAndResolve(zipPath);
        return {
            ...dataPaths,
            repairedZipPath: undefined as string | undefined,
        };
    } catch {
        await createCmd(`rm -f "${fixedZipPath}"`, false, jobId);
        await createCmd(
            `zip -FF "${zipPath}" --out "${fixedZipPath}"`,
            false,
            jobId,
        );
        const dataPaths = await extractAndResolve(fixedZipPath);
        return { ...dataPaths, repairedZipPath: fixedZipPath };
    }
};

const safeCleanupDolphinAndroidWork = async (
    extractDir: string,
    zipPaths: string[],
    jobId?: string,
) => {
    try {
        await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    } catch (err) {
        console.error("Failed to clean Dolphin work dir", err);
    }
    for (const zipPath of zipPaths) {
        try {
            await createCmd(`rm -f "${zipPath}"`, false, jobId);
        } catch (err) {
            console.error("Failed to clean Dolphin zip", err);
        }
    }
};

const pushDolphinAndroid = async (
    device: EmuDevice,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (!device.dolphinDroidDump) return;
    const { workDir, extractDir, baseZipPath, exportZipPath } =
        getDolphinAndroidPaths(serverInfo);
    const remoteBaseZipPath = `${device.dolphinDroidDump}/${DOLPHIN_ANDROID_BASE_ZIP}`;
    const remoteExportZipPath = `${device.dolphinDroidDump}/${DOLPHIN_ANDROID_EXPORT_ZIP}`;

    await createCmd(`mkdir -p "${workDir}"`, false, jobId);
    await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    await createCmd(`rm -f "${baseZipPath}"`, false, jobId);
    await createCmd(`rm -f "${exportZipPath}"`, false, jobId);

    await createCmd(
        buildSshCommand(
            device,
            `if [ ! -f "${remoteBaseZipPath}" ]; then echo "missing dolphin zip" >&2; exit 1; fi`,
        ),
        false,
        jobId,
    );

    let repairedZipPath: string | undefined;

    try {
        await createCmd(
            buildScpCommand(device, remoteBaseZipPath, baseZipPath, false),
            false,
            jobId,
        );
        const dataPaths = await extractDolphinAndroidData(
            baseZipPath,
            extractDir,
            jobId,
        );
        repairedZipPath = dataPaths.repairedZipPath;
        const { rootPath, gcPath, wiiPath } = dataPaths;
        await createCmd(`rm -rf "${gcPath}" "${wiiPath}"`, false, jobId);
        await createCmd(
            `cp -r "${serverInfo.dolphinGC}" "${rootPath}"`,
            false,
            jobId,
        );
        await createCmd(
            `cp -r "${serverInfo.dolphinWii}" "${rootPath}"`,
            false,
            jobId,
        );
        await createCmd(
            `cd "${extractDir}" && zip -r "${exportZipPath}" .`,
            false,
            jobId,
        );
        await createCmd(
            buildSshCommand(device, `rm -f "${remoteExportZipPath}"`),
            false,
            jobId,
        );
        await createCmd(
            buildScpCommand(device, exportZipPath, remoteExportZipPath, true),
            false,
            jobId,
        );
    } finally {
        await safeCleanupDolphinAndroidWork(
            extractDir,
            [
                baseZipPath,
                exportZipPath,
                ...(repairedZipPath ? [repairedZipPath] : []),
            ],
            jobId,
        );
    }
};

const pullDolphinAndroid = async (
    device: EmuDevice,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (!device.dolphinDroidDump) return;
    const { workDir, extractDir, baseZipPath } =
        getDolphinAndroidPaths(serverInfo);
    const remoteBaseZipPath = `${device.dolphinDroidDump}/${DOLPHIN_ANDROID_BASE_ZIP}`;

    await createCmd(`mkdir -p "${workDir}"`, false, jobId);
    await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    await createCmd(`rm -f "${baseZipPath}"`, false, jobId);

    try {
        await createCmd(
            buildSshCommand(
                device,
                `if [ ! -f "${remoteBaseZipPath}" ]; then echo "missing dolphin zip" >&2; exit 1; fi`,
            ),
            false,
            jobId,
        );
    } catch {
        return;
    }

    let repairedZipPath: string | undefined;

    try {
        await createCmd(
            buildScpCommand(device, remoteBaseZipPath, baseZipPath, false),
            false,
            jobId,
        );
        const dataPaths = await extractDolphinAndroidData(
            baseZipPath,
            extractDir,
            jobId,
        );
        repairedZipPath = dataPaths.repairedZipPath;
        const { gcPath, wiiPath } = dataPaths;
        await createCmd(`rm -rf "${serverInfo.dolphinGC}"`, false, jobId);
        await createCmd(`rm -rf "${serverInfo.dolphinWii}"`, false, jobId);
        await createCmd(
            `mv "${gcPath}" "${serverInfo.dolphinGC}"`,
            false,
            jobId,
        );
        await createCmd(
            `mv "${wiiPath}" "${serverInfo.dolphinWii}"`,
            false,
            jobId,
        );
    } finally {
        await safeCleanupDolphinAndroidWork(
            extractDir,
            [baseZipPath, ...(repairedZipPath ? [repairedZipPath] : [])],
            jobId,
        );
    }
};

export const push = async (
    device: EmuDevice,
    emulator: Emulator,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (device.os === EmuOs.android && emulator === Emulator.dolphin) {
        await pushDolphinAndroid(device, serverInfo, jobId);
        return;
    }

    const manageEmu = getManageFn(emulator);
    const serverPairs: SyncPair[] = manageEmu(device, serverInfo, true);
    await pushPairs(device, serverPairs, jobId);
};

export const pull = async (
    device: EmuDevice,
    emulator: Emulator,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (device.os === EmuOs.android && emulator === Emulator.dolphin) {
        await pullDolphinAndroid(device, serverInfo, jobId);
        return;
    }

    const manageEmu = getManageFn(emulator);
    const serverPairs: SyncPair[] = manageEmu(device, serverInfo, false);
    await pullPairs(device, serverPairs, serverInfo, jobId);
};

// Runs a device sync based on a DeviceSyncRequest
export const runDeviceSync = async (
    request: DeviceSyncRequest,
    device: EmuDevice,
    serverInfo: EmuServer,
    options?: { jobId?: string },
): Promise<string[]> => {
    const logs: string[] = [];
    const jobId = options?.jobId;

    for (const { emulator, action } of request.emulatorActions) {
        try {
            if (action === SyncAction.push) {
                logs.push(`push:${emulator}`);
                await push(device, emulator, serverInfo, jobId);
            } else if (action === SyncAction.pull) {
                logs.push(`pull:${emulator}`);
                await pull(device, emulator, serverInfo, jobId);
            } else {
                logs.push(`ignore:${emulator}`);
            }
        } catch (err) {
            logs.push(`error:${emulator}:${(err as Error).message}`);
        }
    }

    return logs;
};
