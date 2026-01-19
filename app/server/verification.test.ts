import { describe, expect, it } from "vitest";
import { EmuOs, SyncType } from "./types";
import { parseOs, verifyDevices } from "./verification";

type DeviceInput = {
    name: string;
    ip: string;
    port: number;
    user: string;
    password: string;
    os: string;
};

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
