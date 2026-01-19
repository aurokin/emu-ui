import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DeviceProvider, useDevices } from "~/contexts/DeviceContext";

function DeviceConsumer() {
    const {
        devices,
        loading,
        error,
        selectedDevice,
        setSelectedDevice,
        requestInProgress,
        setRequestInProgress,
    } = useDevices();

    return (
        <div>
            <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
            <div data-testid="error">{error ?? ""}</div>
            <div data-testid="count">{devices.length}</div>
            <div data-testid="selected">{selectedDevice ?? ""}</div>
            <div data-testid="request">{requestInProgress ? "yes" : "no"}</div>
            <button onClick={() => setSelectedDevice("Alpha")}>Select</button>
            <button onClick={() => setRequestInProgress(true)}>Request</button>
        </div>
    );
}

describe("DeviceContext", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("loads devices", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                new Response(
                    JSON.stringify([
                        { name: "Alpha", os: "linux", emulatorsEnabled: [] },
                    ]),
                    { status: 200 },
                ),
            );
        vi.stubGlobal("fetch", fetchMock);

        render(
            <DeviceProvider>
                <DeviceConsumer />
            </DeviceProvider>,
        );

        await waitFor(() =>
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded"),
        );
        expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    it("handles fetch errors", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(new Response("fail", { status: 500 }));
        vi.stubGlobal("fetch", fetchMock);

        render(
            <DeviceProvider>
                <DeviceConsumer />
            </DeviceProvider>,
        );

        await waitFor(() =>
            expect(screen.getByTestId("error")).toHaveTextContent(
                "HTTP error! status: 500",
            ),
        );
    });

    it("updates selection and request flags", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                new Response(
                    JSON.stringify([
                        { name: "Alpha", os: "linux", emulatorsEnabled: [] },
                    ]),
                    { status: 200 },
                ),
            );
        vi.stubGlobal("fetch", fetchMock);

        render(
            <DeviceProvider>
                <DeviceConsumer />
            </DeviceProvider>,
        );

        await waitFor(() =>
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded"),
        );

        fireEvent.click(screen.getByText("Select"));
        expect(screen.getByTestId("selected")).toHaveTextContent("Alpha");

        fireEvent.click(screen.getByText("Request"));
        expect(screen.getByTestId("request")).toHaveTextContent("yes");
    });
});
