import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Device, DeviceSyncResponse } from "~/types/device";
import type { EmulatorActions } from "~/types/emulatorAction";

interface DeviceContextType {
    devices: Device[];
    loading: boolean;
    error: string | null;
    selectedDevice: string | null;
    setSelectedDevice: (deviceName: string | null) => void;
    emulatorActions: EmulatorActions;
    setEmulatorActions: (actions: EmulatorActions) => void;
    deviceSyncResponse: DeviceSyncResponse | null;
    setDeviceSyncResponse: (resp: DeviceSyncResponse | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
    children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [emulatorActions, setEmulatorActions] = useState<EmulatorActions>({});
    const [deviceSyncResponse, setDeviceSyncResponse] =
        useState<DeviceSyncResponse | null>(null);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/devices");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDevices(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch devices",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const value: DeviceContextType = {
        devices,
        loading,
        error,
        selectedDevice,
        setSelectedDevice,
        emulatorActions,
        setEmulatorActions,
        deviceSyncResponse,
        setDeviceSyncResponse,
    };

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevices() {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error("useDevices must be used within a DeviceProvider");
    }
    return context;
}
