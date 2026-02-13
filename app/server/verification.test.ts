import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmuServer } from "./types";
import { EmuOs, SyncType } from "./types";
import {
    parseInfo,
    parseOs,
    serverHasFolders,
    shouldLaunch,
    verifyDevices,
} from "./verification";

type DeviceInput = {
    name: string;
    ip: string;
    port: number;
    user: string;
    password: string;
    os: string;
};

const fsMocks = vi.hoisted(() => ({
    readFile: vi.fn(),
    access: vi.fn(),
}));

const spawnMocks = vi.hoisted(() => ({
    spawn: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
    default: {
        readFile: fsMocks.readFile,
        access: fsMocks.access,
    },
    readFile: fsMocks.readFile,
    access: fsMocks.access,
}));

vi.mock("node:child_process", () => ({
    spawn: spawnMocks.spawn,
    default: {
        spawn: spawnMocks.spawn,
    },
}));

const buildDeviceInput = (
    overrides: Partial<DeviceInput> = {},
): DeviceInput => ({
    name: "Alpha",
    ip: "192.168.1.10",
    port: 22,
    user: "emu",
    password: "sync",
    os: "linux",
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

const mockSpawnExit = (code: number) => {
    spawnMocks.spawn.mockImplementation(() => {
        const emitter = new EventEmitter();
        setTimeout(() => emitter.emit("exit", code), 0);
        return emitter as unknown as {
            on: (event: string, cb: (...args: unknown[]) => void) => void;
        };
    });
};

beforeEach(() => {
    vi.clearAllMocks();
    fsMocks.access.mockResolvedValue(undefined);
    mockSpawnExit(0);
});

describe("parseOs", () => {
    it("maps known OS strings", () => {
        expect(parseOs("android")).toBe(EmuOs.android);
        expect(parseOs("muos")).toBe(EmuOs.muos);
        expect(parseOs("nx")).toBe(EmuOs.nx);
        expect(parseOs("windows")).toBe(EmuOs.windows);
    });

    it("defaults to linux for unknown values", () => {
        expect(parseOs("unknown")).toBe(EmuOs.linux);
    });
});

describe("verifyDevices", () => {
    it("filters, sorts, and enriches devices", () => {
        const devices: unknown[] = [
            buildDeviceInput({ name: "Beta", os: "nx" }),
            { name: "Invalid" },
            buildDeviceInput({ name: "Alpha", os: "android" }),
        ];

        const result = verifyDevices(devices);

        expect(result.map((device) => device.name)).toEqual(["Alpha", "Beta"]);
        expect(result[0].os).toBe(EmuOs.android);
        expect(result[0].syncType).toBe(SyncType.ssh);
        expect(result[1].os).toBe(EmuOs.nx);
        expect(result[1].syncType).toBe(SyncType.ftp);
    });
});

describe("server verification", () => {
    it("confirms server folders", async () => {
        const serverInfo = buildServer();
        fsMocks.access.mockResolvedValue(undefined);

        await expect(serverHasFolders(serverInfo)).resolves.toBe(true);
    });

    it("fails when folders are missing", async () => {
        const serverInfo = buildServer();
        fsMocks.access.mockRejectedValue(new Error("missing"));

        await expect(serverHasFolders(serverInfo)).resolves.toBe(false);
    });

    it("parses device and server info", async () => {
        const serverInfo = buildServer();
        fsMocks.readFile.mockResolvedValue(
            JSON.stringify({
                devices: [buildDeviceInput({ os: "android" })],
                server: serverInfo,
            }),
        );

        const result = await parseInfo();

        expect(result.devices).toHaveLength(1);
        expect(result.devices[0].syncType).toBe(SyncType.ssh);
        expect(result.serverInfo).toEqual(serverInfo);
    });

    it("reports launch readiness", async () => {
        const serverInfo = buildServer();
        mockSpawnExit(0);

        await expect(shouldLaunch(serverInfo)).resolves.toBe(true);
    });

    it("fails launch readiness when binaries missing", async () => {
        const serverInfo = buildServer();
        mockSpawnExit(1);

        await expect(shouldLaunch(serverInfo)).resolves.toBe(false);
    });
});
