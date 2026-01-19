import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeviceSyncRecord } from "~/server/types";
import { SyncStatus } from "~/server/types";
import { loader } from "./api.device-sync.$id";
import { initializeServer } from "~/server";
import { getJSON } from "~/server/redis";

vi.mock("~/server", () => ({
    initializeServer: vi.fn(),
}));

vi.mock("~/server/redis", () => ({
    getJSON: vi.fn(),
}));

const initializeServerMock = vi.mocked(initializeServer);
const getJSONMock = vi.mocked(getJSON);

const callLoader = (id?: string) =>
    loader({ params: { id } } as unknown as Parameters<typeof loader>[0]);

describe("api.device-sync.$id loader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        initializeServerMock.mockResolvedValue(undefined);
        getJSONMock.mockResolvedValue(null);
    });

    it("requires id param", async () => {
        const response = await callLoader(undefined);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain("Missing id");
    });

    it("returns 404 when record missing", async () => {
        const response = await callLoader("job-1");

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toContain("not found");
    });

    it("returns stored record", async () => {
        const record: DeviceSyncRecord = {
            deviceSyncRequest: {
                deviceName: "Alpha",
                emulatorActions: [],
            },
            status: SyncStatus.COMPLETE,
            output: [],
        };
        getJSONMock.mockResolvedValue(record);

        const response = await callLoader("job-1");

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.deviceSyncRecord).toEqual(record);
    });

    it("handles redis errors", async () => {
        getJSONMock.mockRejectedValue(new Error("boom"));

        const response = await callLoader("job-1");

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toContain("Failed to retrieve record");
    });
});
