import { describe, expect, it } from "vitest";
import type { EmuDevice } from "./types";
import { EmuOs, Emulator, SyncType } from "./types";
import {
    convertEmuDeviceToSimpleDevice,
    getFolderName,
    getSyncTypeForOs,
} from "./utility";

const buildDevice = (overrides: Partial<EmuDevice> = {}): EmuDevice => ({
    name: "Main Rig",
    ip: "10.0.0.10",
    port: 22,
    user: "root",
    password: "secret",
    os: EmuOs.linux,
    syncType: SyncType.ssh,
    cemuSave: undefined,
    azahar: undefined,
    dolphinDroidDump: undefined,
    dolphinGC: undefined,
    dolphinWii: undefined,
    mupenFzSave: undefined,
    nethersx2Save: undefined,
    nethersx2DroidDump: undefined,
    melonds: undefined,
    pcsx2Save: undefined,
    ppssppSave: undefined,
    ppssppState: undefined,
    retroarchSave: undefined,
    retroarchState: undefined,
    rpcs3Save: undefined,
    ryujinxSave: undefined,
    switchSave: undefined,
    vita3kSave: undefined,
    xemuSave: undefined,
    xeniaSave: undefined,
    yuzuDroid: undefined,
    yuzuDroidDump: undefined,
    yuzuSave: undefined,
    workDir: "/srv/emu",
    ...overrides,
});

describe("utility helpers", () => {
    it("returns folder names from paths", () => {
        expect(getFolderName("/srv/emu/config")).toBe("config");
    });

    it("maps sync type based on OS", () => {
        expect(getSyncTypeForOs(EmuOs.nx)).toBe(SyncType.ftp);
        expect(getSyncTypeForOs(EmuOs.linux)).toBe(SyncType.ssh);
    });
});

describe("convertEmuDeviceToSimpleDevice", () => {
    it("detects desktop emulators", () => {
        const device = buildDevice({
            cemuSave: "/emu/cemu",
            azahar: "/storage/emu/azahar",
            melonds: "/emu/melonds",
            dolphinGC: "/emu/dolphin/GC",
            dolphinWii: "/emu/dolphin/Wii",
            pcsx2Save: "/emu/pcsx2",
        });

        const result = convertEmuDeviceToSimpleDevice(device);

        expect(result).toEqual({
            name: device.name,
            os: device.os,
            emulatorsEnabled: [
                Emulator.cemu,
                Emulator.azahar,
                Emulator.dolphin,
                Emulator.melonds,
                Emulator.pcsx2,
            ],
        });
    });

    it("handles android-specific requirements", () => {
        const device = buildDevice({
            os: EmuOs.android,
            dolphinDroidDump: "/sdcard/dolphin",
            nethersx2Save: "/sdcard/nethersx2",
            nethersx2DroidDump: "/sdcard/nethersx2/dump",
            yuzuDroid: "/sdcard/yuzu",
            yuzuDroidDump: "/sdcard/yuzu/dump",
        });

        const result = convertEmuDeviceToSimpleDevice(device);

        expect(result.emulatorsEnabled).toEqual([
            Emulator.dolphin,
            Emulator.nethersx2,
            Emulator.yuzu,
        ]);
    });
});
