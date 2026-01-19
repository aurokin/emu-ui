import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./home";

const useDevicesMock = vi.fn();

vi.mock("~/contexts/DeviceContext", () => ({
    useDevices: () => useDevicesMock(),
}));

vi.mock("~/components/EmulatorActionForm", () => ({
    EmulatorActionForm: () => <div data-testid="emu-form" />,
}));

describe("Home route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useDevicesMock.mockReturnValue({
            devices: [{ name: "Alpha", os: "linux", emulatorsEnabled: [] }],
            loading: false,
            error: null,
            selectedDevice: null,
            setSelectedDevice: vi.fn(),
            requestInProgress: false,
        });
    });

    it("renders device list", () => {
        render(<Home />);

        expect(screen.getByText("Choose a device to sync")).toBeInTheDocument();
        expect(screen.getByText("Alpha")).toBeInTheDocument();
        expect(screen.getByTestId("emu-form")).toBeInTheDocument();
    });
});
