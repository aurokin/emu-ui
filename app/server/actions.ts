import type {
    EmuDevice,
    EmuServer,
    SyncPair,
    DeviceSyncRequest,
} from "./types";
import { EmuOs, Emulator, SyncAction } from "./types";
import { buildSshCommand, createCmd, pushPairs, pullPairs } from "./backup";
import { getManageFn } from "./emulator_managers";

export const push = async (
    device: EmuDevice,
    emulator: Emulator,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    const manageEmu = getManageFn(emulator);
    const serverPairs: SyncPair[] = manageEmu(device, serverInfo, true);
    await pushPairs(device, serverPairs, jobId);

    // Android-specific extra step for Dolphin
    if (device.os === EmuOs.android && emulator === Emulator.dolphin) {
        const extraCmd = buildSshCommand(
            device,
            `bash ${device.androidScripts}/merge_dolphin.sh`,
        );
        await createCmd(extraCmd, false, jobId);
    }
};

export const pull = async (
    device: EmuDevice,
    emulator: Emulator,
    serverInfo: EmuServer,
    jobId?: string,
) => {
    const manageEmu = getManageFn(emulator);
    const serverPairs: SyncPair[] = manageEmu(device, serverInfo, false);
    await pullPairs(device, serverPairs, serverInfo, jobId);
};

// Runs a device sync based on a DeviceSyncRequest
export const runDeviceSync = async (
    request: DeviceSyncRequest,
    device: EmuDevice,
    serverInfo: EmuServer,
    options?: { jobId?: string },
): Promise<string[]> => {
    const logs: string[] = [];
    const jobId = options?.jobId;

    for (const { emulator, action } of request.emulatorActions) {
        try {
            if (action === SyncAction.push) {
                logs.push(`push:${emulator}`);
                await push(device, emulator, serverInfo, jobId);
            } else if (action === SyncAction.pull) {
                logs.push(`pull:${emulator}`);
                await pull(device, emulator, serverInfo, jobId);
            } else {
                logs.push(`ignore:${emulator}`);
            }
        } catch (err) {
            logs.push(`error:${emulator}:${(err as Error).message}`);
        }
    }

    return logs;
};
