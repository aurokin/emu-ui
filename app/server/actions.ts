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

const DOLPHIN_ANDROID_ZIP = "dolphin_emu.zip";
const DOLPHIN_ANDROID_DIR = "dolphin_emu";

const getDolphinAndroidPaths = (serverInfo: EmuServer) => {
    const workDir = serverInfo.workDir;
    const extractDir = path.posix.join(workDir, DOLPHIN_ANDROID_DIR);
    const zipPath = path.posix.join(workDir, DOLPHIN_ANDROID_ZIP);
    return {
        workDir,
        extractDir,
        zipPath,
        gcPath: path.posix.join(extractDir, "GC"),
        wiiPath: path.posix.join(extractDir, "Wii"),
    };
};

const ensureDolphinAndroidData = async (extractDir: string) => {
    const gcPath = path.posix.join(extractDir, "GC");
    const wiiPath = path.posix.join(extractDir, "Wii");
    const [gcStats, wiiStats] = await Promise.all([
        fs.stat(gcPath),
        fs.stat(wiiPath),
    ]);
    if (!gcStats.isDirectory() || !wiiStats.isDirectory()) {
        throw new Error("Dolphin zip missing GC/Wii data");
    }
    return { gcPath, wiiPath };
};

const safeCleanupDolphinAndroidWork = async (
    extractDir: string,
    zipPath: string,
    jobId?: string,
) => {
    try {
        await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    } catch (err) {
        console.error("Failed to clean Dolphin work dir", err);
    }
    try {
        await createCmd(`rm -f "${zipPath}"`, false, jobId);
    } catch (err) {
        console.error("Failed to clean Dolphin zip", err);
    }
};

const pushDolphinAndroid = async (
    device: EmuDevice,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (!device.dolphinDroidDump) return;
    const { workDir, extractDir, zipPath } = getDolphinAndroidPaths(serverInfo);
    const remoteZipPath = `${device.dolphinDroidDump}/${DOLPHIN_ANDROID_ZIP}`;

    await createCmd(`mkdir -p "${workDir}"`, false, jobId);
    await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    await createCmd(`rm -f "${zipPath}"`, false, jobId);

    try {
        await createCmd(`mkdir -p "${extractDir}"`, false, jobId);
        await createCmd(
            `cp -r "${serverInfo.dolphinGC}" "${extractDir}"`,
            false,
            jobId,
        );
        await createCmd(
            `cp -r "${serverInfo.dolphinWii}" "${extractDir}"`,
            false,
            jobId,
        );
        await createCmd(
            `cd "${extractDir}" && zip -r "${zipPath}" GC Wii`,
            false,
            jobId,
        );
        await createCmd(
            buildScpCommand(device, zipPath, remoteZipPath, true),
            false,
            jobId,
        );
    } finally {
        await safeCleanupDolphinAndroidWork(extractDir, zipPath, jobId);
    }
};

const pullDolphinAndroid = async (
    device: EmuDevice,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    if (!device.dolphinDroidDump) return;
    const { workDir, extractDir, zipPath } = getDolphinAndroidPaths(serverInfo);
    const remoteZipPath = `${device.dolphinDroidDump}/${DOLPHIN_ANDROID_ZIP}`;

    await createCmd(`mkdir -p "${workDir}"`, false, jobId);
    await createCmd(`rm -rf "${extractDir}"`, false, jobId);
    await createCmd(`rm -f "${zipPath}"`, false, jobId);

    try {
        await createCmd(
            buildSshCommand(
                device,
                `if [ ! -f "${remoteZipPath}" ]; then echo "missing dolphin zip" >&2; exit 1; fi`,
            ),
            false,
            jobId,
        );
    } catch {
        return;
    }

    try {
        await createCmd(
            buildScpCommand(device, remoteZipPath, zipPath, false),
            false,
            jobId,
        );
        await createCmd(`mkdir -p "${extractDir}"`, false, jobId);
        await createCmd(
            `unzip -o "${zipPath}" -d "${extractDir}"`,
            false,
            jobId,
        );
        const { gcPath, wiiPath } = await ensureDolphinAndroidData(extractDir);
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
        await safeCleanupDolphinAndroidWork(extractDir, zipPath, jobId);
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
