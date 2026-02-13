export type SimpleDevice = {
    name: string;
    os: EmuOs;
    emulatorsEnabled: Emulator[];
};

export type EmuDevice = {
    name: string;
    ip: string;
    port: number;
    user: string;
    password: string;
    os: EmuOs;
    syncType: SyncType;
    cemuSave: string | undefined;
    azahar: string | undefined;
    dolphinDroidDump: string | undefined;
    dolphinGC: string | undefined;
    dolphinWii: string | undefined;
    mupenFzSave: string | undefined;
    nethersx2Save: string | undefined;
    nethersx2DroidDump: string | undefined;
    melonds: string | undefined;
    pcsx2Save: string | undefined;
    ppssppSave: string | undefined;
    ppssppState: string | undefined;
    retroarchSave: string | undefined;
    retroarchState: string | undefined;
    rpcs3Save: string | undefined;
    ryujinxSave: string | undefined;
    switchSave: string | undefined;
    vita3kSave: string | undefined;
    xemuSave: string | undefined;
    xeniaSave: string | undefined;
    yuzuDroid: string | undefined;
    yuzuDroidDump: string | undefined;
    yuzuSave: string | undefined;
    workDir: string;
};

export type EmuServer = {
    cemuSave: string;
    azahar: string;
    dolphinGC: string;
    dolphinWii: string;
    nethersx2Save: string;
    mupenFzSave: string;
    ppssppSave: string;
    ppssppState: string;
    retroarchSave: string;
    retroarchState: string;
    retroarchRgState: string;
    rpcs3Save: string;
    ryujinxSave: string;
    switchSave: string;
    melonds: string;
    vita3kSave: string;
    xemuSave: string;
    xeniaSave: string;
    yuzuSave: string;
    workDir: string;
};

export enum EmuOs {
    android = "android",
    linux = "linux",
    muos = "muos",
    nx = "nx",
    windows = "windows",
}

export enum Emulator {
    cemu = "cemu",
    azahar = "azahar",
    dolphin = "dolphin",
    mupen = "mupen",
    nethersx2 = "nethersx2",
    melonds = "melonds",
    pcsx2 = "pcsx2",
    ppsspp = "ppsspp",
    retroarch = "retroarch",
    rpcs3 = "rpcs3",
    ryujinx = "ryujinx",
    switch = "switch",
    vita3k = "vita3k",
    xemu = "xemu",
    xenia = "xenia",
    yuzu = "yuzu",
}

export enum SyncAction {
    ignore = "ignore",
    push = "push",
    pull = "pull",
}

export enum SyncType {
    ssh = "ssh",
    ftp = "ftp",
}

// Request typing for device sync
export type EmulatorActionEntry = {
    emulator: Emulator;
    action: SyncAction;
};

export type DeviceSyncRequest = {
    deviceName: string;
    emulatorActions: EmulatorActionEntry[];
};

export enum SyncStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
    COMPLETE = "COMPLETE",
}

// Represents a sync job/response stored in Redis
export type DeviceSyncRecord = {
    deviceSyncRequest: DeviceSyncRequest;
    status: SyncStatus;
    output: string[];
};

export type DeviceSyncResponse = {
    id: string;
    deviceSyncRecord: DeviceSyncRecord;
};

export type SyncPair = {
    source: string;
    target: string;
};
