import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import type { EmuDevice, EmuServer } from "./types";
import { EmuOs } from "./types";
import { getSyncTypeForOs } from "./utility";

// Database interface for db.json
interface Database {
    devices: unknown[];
    server: unknown;
}

// Load database from environment-configurable path or default
const loadDatabase = async (): Promise<Database> => {
    const dbPath = process.env.DB_PATH || "./db.json";
    const content = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(content) as Database;
};

const hasBinary = async (binary: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const proc = spawn("bash", ["-c", `command -v ${binary}`]);
        proc.on("error", () => resolve(false));
        proc.on("exit", (code) => resolve(code === 0));
    });
};

const serverHasBinaries = async (binaries: string[]) => {
    const results = await Promise.all(
        binaries.map((binary) => hasBinary(binary)),
    );
    const missing = binaries.filter((_, index) => !results[index]);
    if (missing.length > 0) {
        console.error(`Missing required binaries: ${missing.join(", ")}`);
        return false;
    }
    return true;
};

const isEmuDevice = (device: unknown): device is EmuDevice => {
    return (
        device !== null &&
        typeof device === "object" &&
        "name" in device &&
        "ip" in device &&
        "port" in device &&
        "user" in device &&
        "password" in device &&
        "os" in device
    );
};

const isEmuServer = (server: unknown): server is EmuServer => {
    return (
        server !== null &&
        typeof server === "object" &&
        "cemuSave" in server &&
        "citraNand" in server &&
        "citraSdmc" in server &&
        "citraSysdata" in server &&
        "dolphinGC" in server &&
        "dolphinWii" in server &&
        "mupenFzSave" in server &&
        "nethersx2Save" in server &&
        "melonds" in server &&
        "ppssppSave" in server &&
        "ppssppState" in server &&
        "retroarchSave" in server &&
        "retroarchState" in server &&
        "retroarchRgState" in server &&
        "rpcs3Save" in server &&
        "ryujinxSave" in server &&
        "switchSave" in server &&
        "vita3kSave" in server &&
        "xemuSave" in server &&
        "xeniaSave" in server &&
        "yuzuSave" in server &&
        "workDir" in server
    );
};

export const parseOs = (os: string): EmuOs => {
    if (typeof os !== "string") {
        return EmuOs.linux;
    }

    if (os === "muos") {
        return EmuOs.muos;
    } else if (os === "android") {
        return EmuOs.android;
    } else if (os === "nx") {
        return EmuOs.nx;
    } else if (os === "windows") {
        return EmuOs.windows;
    }

    return EmuOs.linux;
};

export const verifyDevices = (devices: unknown[]): EmuDevice[] => {
    const verifiedDevices: EmuDevice[] = devices
        .filter(isEmuDevice)
        .map((device) => {
            const os = parseOs(device.os as string);
            return { ...device, os, syncType: getSyncTypeForOs(os) };
        });

    const sortedDevices = verifiedDevices.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        }

        return 0;
    });
    return sortedDevices;
};

export const verifyServer = (server: unknown): EmuServer | null => {
    if (isEmuServer(server)) {
        return { ...server };
    }
    return null;
};

export const serverHasFolders = async (server: EmuServer) => {
    try {
        const paths = [
            server.cemuSave,
            server.citraNand,
            server.citraSdmc,
            server.citraSysdata,
            server.dolphinGC,
            server.dolphinWii,
            server.mupenFzSave,
            server.nethersx2Save,
            server.melonds,
            server.ppssppSave,
            server.ppssppState,
            server.retroarchSave,
            server.retroarchState,
            server.retroarchRgState,
            server.rpcs3Save,
            server.ryujinxSave,
            server.switchSave,
            server.vita3kSave,
            server.xemuSave,
            server.xeniaSave,
            server.yuzuSave,
        ];
        await Promise.all(paths.map((p) => fs.access(p)));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const parseInfo = async () => {
    const database = await loadDatabase();
    const devices: EmuDevice[] = verifyDevices(database.devices);
    const serverInfo: EmuServer | null = verifyServer(database.server);
    return { devices, serverInfo };
};

export const shouldLaunch = async (serverInfo: EmuServer) => {
    const [foldersOk, binariesOk] = await Promise.all([
        serverHasFolders(serverInfo),
        serverHasBinaries(["zip", "unzip"]),
    ]);
    return foldersOk && binariesOk;
};
