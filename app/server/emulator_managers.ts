import type { EmuDevice, EmuServer, SyncPair } from "./types";
import { EmuOs, Emulator } from "./types";

export const getManageFn = (
    emulator: Emulator,
): ((
    device: EmuDevice,
    serverInfo: EmuServer,
    isPush: boolean,
) => SyncPair[]) => {
    if (emulator === Emulator.cemu) {
        return manageCemu;
    } else if (emulator === Emulator.citra) {
        return manageCitra;
    } else if (emulator === Emulator.dolphin) {
        return manageDolphin;
    } else if (emulator === Emulator.mupen) {
        return manageMupenFz;
    } else if (emulator === Emulator.melonds) {
        return manageMelonds;
    } else if (emulator === Emulator.nethersx2) {
        return manageNethersx2;
    } else if (emulator === Emulator.pcsx2) {
        return managePcsx2;
    } else if (emulator === Emulator.ppsspp) {
        return managePpsspp;
    } else if (emulator === Emulator.retroarch) {
        return manageRetroarch;
    } else if (emulator === Emulator.rpcs3) {
        return manageRpcs3;
    } else if (emulator === Emulator.ryujinx) {
        return manageRyujinx;
    } else if (emulator === Emulator.switch) {
        return manageSwitch;
    } else if (emulator === Emulator.vita3k) {
        return manageVita3k;
    } else if (emulator === Emulator.xemu) {
        return manageXemu;
    } else if (emulator === Emulator.xenia) {
        return manageXenia;
    } else if (emulator === Emulator.yuzu) {
        return manageYuzu;
    } else {
        throw new Error("Unknown Console");
    }
};

const simpleManage = (
    serverPath: string,
    devicePath: string,
    push: boolean,
): SyncPair[] => {
    return [
        {
            source: push ? serverPath : devicePath,
            target: push ? devicePath : serverPath,
        },
    ];
};
const manageCemu = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.cemuSave) return [];
    return simpleManage(serverInfo.cemuSave, device.cemuSave, push);
};

const manageCitra = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    const pairs: SyncPair[] = [];
    if (device.citraNand)
        pairs.push(
            ...simpleManage(serverInfo.citraNand, device.citraNand, push),
        );
    if (device.citraSdmc)
        pairs.push(
            ...simpleManage(serverInfo.citraSdmc, device.citraSdmc, push),
        );
    if (device.citraSysdata)
        pairs.push(
            ...simpleManage(serverInfo.citraSysdata, device.citraSysdata, push),
        );
    return pairs;
};

const manageDolphin = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (device.os !== EmuOs.android) {
        const pairs: SyncPair[] = [];
        if (device.dolphinGC)
            pairs.push(
                ...simpleManage(serverInfo.dolphinGC, device.dolphinGC, push),
            );
        if (device.dolphinWii)
            pairs.push(
                ...simpleManage(serverInfo.dolphinWii, device.dolphinWii, push),
            );
        return pairs;
    }
    return [];
};

const manageMupenFz = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.mupenFzSave) return [];
    return simpleManage(serverInfo.mupenFzSave, device.mupenFzSave, push);
};

const manageMelonds = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.melonds) return [];
    return simpleManage(serverInfo.melonds, device.melonds, push);
};

const manageNethersx2 = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (push && !device.nethersx2DroidDump) return [];
    if (!push && !device.nethersx2Save) return [];
    return [
        {
            source: push ? serverInfo.nethersx2Save : device.nethersx2Save!,
            target: push
                ? device.nethersx2DroidDump!
                : serverInfo.nethersx2Save,
        },
    ];
};

const managePcsx2 = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.pcsx2Save) return [];
    const serverPairs: SyncPair[] = [];
    if (push) {
        serverPairs.push({
            source: serverInfo.nethersx2Save,
            target: device.pcsx2Save,
        });
    } else {
        serverPairs.push({
            source: device.pcsx2Save,
            target: serverInfo.nethersx2Save,
        });
    }
    return serverPairs;
};

const managePpsspp = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    const pairs: SyncPair[] = [];
    if (device.ppssppSave)
        pairs.push(
            ...simpleManage(serverInfo.ppssppSave, device.ppssppSave, push),
        );
    if (device.ppssppState)
        pairs.push(
            ...simpleManage(serverInfo.ppssppState, device.ppssppState, push),
        );
    return pairs;
};

const manageRetroarch = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    const serverPairs: SyncPair[] = [];
    if (device.retroarchSave) {
        serverPairs.push(
            ...simpleManage(
                serverInfo.retroarchSave,
                device.retroarchSave,
                push,
            ),
        );
    }
    if (device.retroarchState) {
        if (device.os !== EmuOs.muos) {
            serverPairs.push(
                ...simpleManage(
                    serverInfo.retroarchState,
                    device.retroarchState,
                    push,
                ),
            );
        } else {
            serverPairs.push(
                ...simpleManage(
                    serverInfo.retroarchRgState,
                    device.retroarchState,
                    push,
                ),
            );
        }
    }
    return serverPairs;
};

const manageRpcs3 = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.rpcs3Save) return [];
    return simpleManage(serverInfo.rpcs3Save, device.rpcs3Save, push);
};
const manageRyujinx = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.ryujinxSave) return [];
    return simpleManage(serverInfo.ryujinxSave, device.ryujinxSave, push);
};
const manageSwitch = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.switchSave) return [];
    return simpleManage(serverInfo.switchSave, device.switchSave, push);
};
const manageVita3k = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.vita3kSave) return [];
    return simpleManage(serverInfo.vita3kSave, device.vita3kSave, push);
};
const manageXemu = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.xemuSave) return [];
    return simpleManage(serverInfo.xemuSave, device.xemuSave, push);
};
const manageXenia = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (!device.xeniaSave) return [];
    return simpleManage(serverInfo.xeniaSave, device.xeniaSave, push);
};
const manageYuzu = (
    device: EmuDevice,
    serverInfo: EmuServer,
    push: boolean,
): SyncPair[] => {
    if (device.os !== EmuOs.android) {
        if (!device.yuzuSave) return [];
        return simpleManage(serverInfo.yuzuSave, device.yuzuSave, push);
    } else {
        if (push && !device.yuzuDroidDump) return [];
        if (!push && !device.yuzuSave) return [];
        return [
            {
                source: push ? serverInfo.yuzuSave : device.yuzuSave!,
                target: push ? device.yuzuDroidDump! : serverInfo.yuzuSave,
            },
        ];
    }
};
