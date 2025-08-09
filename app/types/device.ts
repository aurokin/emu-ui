export interface Device {
    name: string;
    os: string;
    emulatorsEnabled: string[];
}
import type { EmulatorActionItem } from "~/types/emulatorAction";

export interface DeviceSyncRequest {
    deviceName: string;
    emulatorActions: EmulatorActionItem[];
}
