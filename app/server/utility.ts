import type { EmuDevice, SimpleDevice } from "./types";
import { Emulator, EmuOs, SyncType } from "./types";
import path from "node:path";

export const getFolderName = (p: string): string => path.posix.basename(p);

export const convertEmuDeviceToSimpleDevice = (
    device: EmuDevice,
): SimpleDevice => {
    const emulatorsEnabled: Emulator[] = [];
    const has = (v: unknown): v is string => typeof v === "string";

    if (has(device.cemuSave)) emulatorsEnabled.push(Emulator.cemu);

    if (
        has(device.citraNand) &&
        has(device.citraSdmc) &&
        has(device.citraSysdata)
    )
        emulatorsEnabled.push(Emulator.citra);

    const dolphinDesktop =
        device.os !== EmuOs.android &&
        has(device.dolphinGC) &&
        has(device.dolphinWii);
    const dolphinAndroid =
        device.os === EmuOs.android && has(device.dolphinDroidDump);
    if (dolphinDesktop || dolphinAndroid)
        emulatorsEnabled.push(Emulator.dolphin);

    if (has(device.mupenFzSave)) emulatorsEnabled.push(Emulator.mupen);

    const nethersx2Ok =
        has(device.nethersx2Save) &&
        (device.os !== EmuOs.android || has(device.nethersx2DroidDump));
    if (nethersx2Ok) emulatorsEnabled.push(Emulator.nethersx2);

    if (has(device.melonds)) emulatorsEnabled.push(Emulator.melonds);

    if (has(device.pcsx2Save)) emulatorsEnabled.push(Emulator.pcsx2);

    if (has(device.ppssppSave) && has(device.ppssppState))
        emulatorsEnabled.push(Emulator.ppsspp);

    if (has(device.retroarchSave) && has(device.retroarchState))
        emulatorsEnabled.push(Emulator.retroarch);

    if (has(device.rpcs3Save)) emulatorsEnabled.push(Emulator.rpcs3);
    if (has(device.ryujinxSave)) emulatorsEnabled.push(Emulator.ryujinx);
    if (device.os === EmuOs.nx && has(device.switchSave))
        emulatorsEnabled.push(Emulator.switch);
    if (has(device.vita3kSave)) emulatorsEnabled.push(Emulator.vita3k);
    if (has(device.xemuSave)) emulatorsEnabled.push(Emulator.xemu);
    if (has(device.xeniaSave)) emulatorsEnabled.push(Emulator.xenia);

    const yuzuAndroid =
        device.os === EmuOs.android &&
        has(device.yuzuDroid) &&
        has(device.yuzuDroidDump);
    const yuzuOther = has(device.yuzuSave);
    if (yuzuAndroid || yuzuOther) emulatorsEnabled.push(Emulator.yuzu);

    return {
        name: device.name,
        os: device.os,
        emulatorsEnabled,
    };
};

export const getSyncTypeForOs = (os: EmuOs): SyncType => {
    if (os === EmuOs.nx) {
        return SyncType.ftp;
    }
    return SyncType.ssh;
};
