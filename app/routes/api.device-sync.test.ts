import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmuDevice, EmuServer } from "~/server/types";
import { Emulator, SyncAction, SyncStatus } from "~/server/types";
import { action } from "./api.device-sync";
import { initializeServer, getEmuDevices, getEmuServer } from "~/server";
import { connectionTest } from "~/server/backup";
import { runDeviceSync } from "~/server/actions";
import { getJSON, setJSON } from "~/server/redis";

vi.mock("~/server", () => ({
    initializeServer: vi.fn(),
    getEmuDevices: vi.fn(),
    getEmuServer: vi.fn(),
}));

vi.mock("~/server/backup", () => ({
    connectionTest: vi.fn(),
}));

vi.mock("~/server/actions", () => ({
    runDeviceSync: vi.fn(),
}));

vi.mock("~/server/redis", () => ({
    setJSON: vi.fn(),
    getJSON: vi.fn(),
}));

const randomUUIDMock = vi.hoisted(() => vi.fn(() => "job-1"));

vi.mock("node:crypto", () => ({
    randomUUID: randomUUIDMock,
    default: {
        randomUUID: randomUUIDMock,
    },
}));

const buildRequest = (body: unknown) =>
    new Request("http://localhost/api/device-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const callAction = (body: unknown) =>
    action({ request: buildRequest(body) } as Parameters<typeof action>[0]);

const device = { name: "Alpha" } as EmuDevice;
const serverInfo = { workDir: "/srv/work" } as EmuServer;

const initializeServerMock = vi.mocked(initializeServer);
const getEmuDevicesMock = vi.mocked(getEmuDevices);
const getEmuServerMock = vi.mocked(getEmuServer);
const connectionTestMock = vi.mocked(connectionTest);
const runDeviceSyncMock = vi.mocked(runDeviceSync);
const setJSONMock = vi.mocked(setJSON);
const getJSONMock = vi.mocked(getJSON);

describe("api.device-sync action", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        initializeServerMock.mockResolvedValue(undefined);
        getEmuDevicesMock.mockReturnValue([device]);
        getEmuServerMock.mockReturnValue(serverInfo);
        connectionTestMock.mockResolvedValue(true);
        runDeviceSyncMock.mockResolvedValue([]);
        setJSONMock.mockResolvedValue(undefined);
        getJSONMock.mockResolvedValue(null);
    });

    it("rejects missing deviceName", async () => {
        const response = await callAction({});

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Missing deviceName",
        });
    });

    it("rejects missing emulatorActions", async () => {
        const response = await callAction({ deviceName: "Alpha" });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain("Missing emulatorActions");
    });

    it("rejects empty emulatorActions", async () => {
        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [],
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain("emulatorActions must include");
    });

    it("rejects invalid emulator", async () => {
        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [{ emulator: "bad", action: "push" }],
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain("Invalid emulator");
    });

    it("rejects invalid action", async () => {
        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [{ emulator: Emulator.cemu, action: "bad" }],
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain("Invalid action");
    });

    it("returns 404 for missing device", async () => {
        getEmuDevicesMock.mockReturnValue([]);

        const response = await callAction({
            deviceName: "Missing",
            emulatorActions: [
                { emulator: Emulator.cemu, action: SyncAction.push },
            ],
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toContain("not found");
    });

    it("returns failed record on connection error", async () => {
        connectionTestMock.mockResolvedValue(false);

        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [
                { emulator: Emulator.cemu, action: SyncAction.push },
            ],
        });

        const body = await response.json();
        expect(body.deviceSyncRecord.status).toBe(SyncStatus.FAILED);
        expect(body.deviceSyncRecord.output).toContain(
            "Connection test failed",
        );
    });

    it("returns 500 when server info missing", async () => {
        getEmuServerMock.mockReturnValue(null);

        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [
                { emulator: Emulator.cemu, action: SyncAction.push },
            ],
        });

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toContain("Server info not initialized");
    });

    it("returns in-progress response", async () => {
        const response = await callAction({
            deviceName: "Alpha",
            emulatorActions: [
                { emulator: Emulator.cemu, action: SyncAction.push },
            ],
        });

        const body = await response.json();
        expect(body.deviceSyncRecord.status).toBe(SyncStatus.IN_PROGRESS);
        expect(setJSONMock).toHaveBeenCalled();
    });
});
