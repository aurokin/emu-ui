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

export enum SyncStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
    COMPLETE = "COMPLETE",
}

export type DeviceSyncRecord = {
    deviceSyncRequest: DeviceSyncRequest;
    status: SyncStatus;
    output: string[];
};

export type DeviceSyncResponse = {
    id: string;
    deviceSyncRecord: DeviceSyncRecord;
};
