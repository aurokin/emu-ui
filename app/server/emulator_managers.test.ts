import { describe, expect, it } from "vitest";
import type { EmuDevice, EmuServer } from "./types";
import { EmuOs, Emulator, SyncType } from "./types";
import { getManageFn } from "./emulator_managers";

const buildDevice = (overrides: Partial<EmuDevice> = {}): EmuDevice => ({
    name: "Rig",
    ip: "10.0.0.10",
    port: 22,
    user: "root",
    password: "secret",
    os: EmuOs.linux,
    syncType: SyncType.ssh,
    cemuSave: undefined,
    citraNand: undefined,
    citraSdmc: undefined,
    citraSysdata: undefined,
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
    workDir: "/tmp/emu",
    ...overrides,
});

const buildServer = (overrides: Partial<EmuServer> = {}): EmuServer => ({
    cemuSave: "/srv/cemu",
    citraNand: "/srv/citra/nand",
    citraSdmc: "/srv/citra/sdmc",
    citraSysdata: "/srv/citra/sysdata",
    dolphinGC: "/srv/dolphin/GC",
    dolphinWii: "/srv/dolphin/Wii",
    nethersx2Save: "/srv/nethersx2",
    melonds: "/srv/melonds",
    mupenFzSave: "/srv/mupen",
    ppssppSave: "/srv/ppsspp",
    ppssppState: "/srv/ppsspp/state",
    retroarchSave: "/srv/retroarch",
    retroarchState: "/srv/retroarch/state",
    retroarchRgState: "/srv/retroarch/rg",
    rpcs3Save: "/srv/rpcs3",
    ryujinxSave: "/srv/ryujinx",
    switchSave: "/srv/switch",
    vita3kSave: "/srv/vita3k",
    xemuSave: "/srv/xemu",
    xeniaSave: "/srv/xenia",
    yuzuSave: "/srv/yuzu",
    workDir: "/srv/work",
    ...overrides,
});

describe("emulator managers", () => {
    it("throws for unknown emulator", () => {
        expect(() => getManageFn("bad" as Emulator)).toThrow("Unknown Console");
    });

    it("builds dolphin pairs for desktop", () => {
        const device = buildDevice({
            dolphinGC: "/device/GC",
            dolphinWii: "/device/Wii",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.dolphin);

        const pairs = manage(device, serverInfo, true);

        expect(pairs).toEqual([
            { source: serverInfo.dolphinGC, target: device.dolphinGC },
            { source: serverInfo.dolphinWii, target: device.dolphinWii },
        ]);
    });

    it("skips dolphin pairs for android", () => {
        const device = buildDevice({
            os: EmuOs.android,
            dolphinDroidDump: "/sdcard/dolphin",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.dolphin);

        expect(manage(device, serverInfo, true)).toEqual([]);
    });

    it("uses android dump for nethersx2 push", () => {
        const device = buildDevice({
            os: EmuOs.android,
            nethersx2Save: "/sdcard/nethersx2",
            nethersx2DroidDump: "/sdcard/nethersx2/dump",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.nethersx2);

        expect(manage(device, serverInfo, true)).toEqual([
            {
                source: serverInfo.nethersx2Save,
                target: device.nethersx2DroidDump,
            },
        ]);
    });

    it("manages melonds with a single shared path", () => {
        const device = buildDevice({
            melonds: "/device/melonds",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.melonds);

        expect(manage(device, serverInfo, true)).toEqual([
            {
                source: serverInfo.melonds,
                target: device.melonds,
            },
        ]);
        expect(manage(device, serverInfo, false)).toEqual([
            {
                source: device.melonds,
                target: serverInfo.melonds,
            },
        ]);
    });

    it("routes retroarch muos to rg states", () => {
        const device = buildDevice({
            os: EmuOs.muos,
            retroarchSave: "/roms/retroarch",
            retroarchState: "/roms/retroarch/states",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.retroarch);

        const pairs = manage(device, serverInfo, false);

        expect(pairs).toEqual([
            {
                source: device.retroarchSave,
                target: serverInfo.retroarchSave,
            },
            {
                source: device.retroarchState,
                target: serverInfo.retroarchRgState,
            },
        ]);
    });

    it("handles android yuzu sync", () => {
        const device = buildDevice({
            os: EmuOs.android,
            yuzuSave: "/sdcard/yuzu",
            yuzuDroidDump: "/sdcard/yuzu/dump",
        });
        const serverInfo = buildServer();
        const manage = getManageFn(Emulator.yuzu);

        expect(manage(device, serverInfo, true)).toEqual([
            {
                source: serverInfo.yuzuSave,
                target: device.yuzuDroidDump,
            },
        ]);
        expect(manage(device, serverInfo, false)).toEqual([
            {
                source: device.yuzuSave,
                target: serverInfo.yuzuSave,
            },
        ]);
    });

    it("maps pcsx2 with server nethersx2 path", () => {
        const device = buildDevice({ pcsx2Save: "/device/pcsx2" });
        const serverInfo = buildServer({ nethersx2Save: "/srv/pcsx2" });
        const manage = getManageFn(Emulator.pcsx2);

        expect(manage(device, serverInfo, true)).toEqual([
            {
                source: serverInfo.nethersx2Save,
                target: device.pcsx2Save,
            },
        ]);
    });
});
