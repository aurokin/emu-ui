import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EmulatorActionForm } from "~/components/EmulatorActionForm";
import { SyncStatus } from "~/types/device";

const useDevicesMock = vi.fn();

vi.mock("~/contexts/DeviceContext", () => ({
    useDevices: () => useDevicesMock(),
}));

const baseDevices = [
    {
        name: "Alpha",
        os: "linux",
        emulatorsEnabled: ["dolphin", "cemu"],
    },
];

const buildContext = (
    overrides: Partial<ReturnType<typeof useDevicesMock>> = {},
) => ({
    devices: baseDevices,
    loading: false,
    error: null,
    selectedDevice: "Alpha",
    setSelectedDevice: vi.fn(),
    emulatorActions: { dolphin: "ignore", cemu: "ignore" },
    setEmulatorActions: vi.fn(),
    deviceSyncResponse: null,
    setDeviceSyncResponse: vi.fn(),
    requestInProgress: false,
    setRequestInProgress: vi.fn(),
    ...overrides,
});

describe("EmulatorActionForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("initializes default actions", async () => {
        const setEmulatorActions = vi.fn();
        const setDeviceSyncResponse = vi.fn();
        const setRequestInProgress = vi.fn();

        useDevicesMock.mockReturnValue(
            buildContext({
                emulatorActions: {},
                setEmulatorActions,
                setDeviceSyncResponse,
                setRequestInProgress,
            }),
        );

        render(<EmulatorActionForm />);

        await waitFor(() =>
            expect(setEmulatorActions).toHaveBeenCalledWith({
                dolphin: "ignore",
                cemu: "ignore",
            }),
        );
        expect(setDeviceSyncResponse).toHaveBeenCalledWith(null);
        expect(setRequestInProgress).toHaveBeenCalledWith(false);
    });

    it("updates action selection", () => {
        const setEmulatorActions = vi.fn();
        useDevicesMock.mockReturnValue(buildContext({ setEmulatorActions }));

        render(<EmulatorActionForm />);

        fireEvent.click(screen.getAllByText("push")[0]);

        expect(setEmulatorActions).toHaveBeenLastCalledWith({
            dolphin: "push",
            cemu: "ignore",
        });
    });

    it("submits sync request", async () => {
        const setDeviceSyncResponse = vi.fn();
        const setRequestInProgress = vi.fn();
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: "job-1",
                    deviceSyncRecord: {
                        deviceSyncRequest: {
                            deviceName: "Alpha",
                            emulatorActions: [
                                { emulator: "dolphin", action: "push" },
                            ],
                        },
                        status: SyncStatus.IN_PROGRESS,
                        output: [],
                    },
                }),
                { status: 200 },
            ),
        );
        vi.stubGlobal("fetch", fetchMock);

        useDevicesMock.mockReturnValue(
            buildContext({
                emulatorActions: { dolphin: "push", cemu: "ignore" },
                setDeviceSyncResponse,
                setRequestInProgress,
            }),
        );

        render(<EmulatorActionForm />);

        fireEvent.click(screen.getByText("Execute Sync"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());

        const [, options] = fetchMock.mock.calls[0];
        const body = JSON.parse(options.body as string);

        expect(body).toEqual({
            deviceName: "Alpha",
            emulatorActions: [{ emulator: "dolphin", action: "push" }],
        });
        expect(setRequestInProgress).toHaveBeenCalledWith(true);
        await waitFor(() =>
            expect(setDeviceSyncResponse).toHaveBeenCalledWith({
                id: "job-1",
                deviceSyncRecord: {
                    deviceSyncRequest: {
                        deviceName: "Alpha",
                        emulatorActions: [
                            { emulator: "dolphin", action: "push" },
                        ],
                    },
                    status: SyncStatus.IN_PROGRESS,
                    output: [],
                },
            }),
        );
    });

    it("polls for status updates", async () => {
        const setDeviceSyncResponse = vi.fn();
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: "job-1",
                    deviceSyncRecord: {
                        deviceSyncRequest: {
                            deviceName: "Alpha",
                            emulatorActions: [],
                        },
                        status: SyncStatus.COMPLETE,
                        output: [],
                    },
                }),
                { status: 200 },
            ),
        );
        vi.stubGlobal("fetch", fetchMock);

        let intervalCallback: (() => void) | undefined;
        vi.spyOn(globalThis, "setInterval").mockImplementation(((
            cb: TimerHandler,
        ) => {
            intervalCallback = cb as () => void;
            return 0 as unknown as ReturnType<typeof setInterval>;
        }) as unknown as typeof setInterval);
        vi.spyOn(globalThis, "clearInterval").mockImplementation(() => {
            return undefined as void;
        });

        useDevicesMock.mockReturnValue(
            buildContext({
                deviceSyncResponse: {
                    id: "job-1",
                    deviceSyncRecord: {
                        deviceSyncRequest: {
                            deviceName: "Alpha",
                            emulatorActions: [],
                        },
                        status: SyncStatus.IN_PROGRESS,
                        output: [],
                    },
                },
                setDeviceSyncResponse,
            }),
        );

        render(<EmulatorActionForm />);

        await intervalCallback?.();

        await waitFor(() =>
            expect(setDeviceSyncResponse).toHaveBeenCalledWith({
                id: "job-1",
                deviceSyncRecord: {
                    deviceSyncRequest: {
                        deviceName: "Alpha",
                        emulatorActions: [],
                    },
                    status: SyncStatus.COMPLETE,
                    output: [],
                },
            }),
        );
    });

    it("clears request flag when completed", async () => {
        const setRequestInProgress = vi.fn();

        useDevicesMock.mockReturnValue(
            buildContext({
                deviceSyncResponse: {
                    id: "job-1",
                    deviceSyncRecord: {
                        deviceSyncRequest: {
                            deviceName: "Alpha",
                            emulatorActions: [],
                        },
                        status: SyncStatus.COMPLETE,
                        output: [],
                    },
                },
                requestInProgress: true,
                setRequestInProgress,
            }),
        );

        render(<EmulatorActionForm />);

        await waitFor(() =>
            expect(setRequestInProgress).toHaveBeenCalledWith(false),
        );
    });
});
