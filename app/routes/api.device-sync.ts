import { randomUUID } from "node:crypto";
import type { ActionFunctionArgs } from "react-router";
import type {
    DeviceSyncRecord,
    DeviceSyncResponse,
    EmulatorActionEntry,
} from "~/server/types";
import { Emulator, SyncAction, SyncStatus } from "~/server/types";
import { initializeServer, getEmuDevices, getEmuServer } from "~/server";
import { connectionTest } from "~/server/backup";
import { runDeviceSync } from "~/server/actions";
import { setJSON, getJSON } from "~/server/redis";

interface DeviceSyncRequestBody {
    deviceName: string;
    emulatorActions: EmulatorActionEntry[];
}

// POST /api/device-sync - Initiates async sync job
export async function action({ request }: ActionFunctionArgs) {
    await initializeServer();

    const body = (await request.json()) as DeviceSyncRequestBody;

    if (!body || !body.deviceName) {
        return Response.json({ error: "Missing deviceName" }, { status: 400 });
    }

    if (!Array.isArray(body.emulatorActions)) {
        return Response.json(
            {
                error: "Missing emulatorActions (array of { emulator, action })",
            },
            { status: 400 },
        );
    }
    if (body.emulatorActions.length === 0) {
        return Response.json(
            { error: "emulatorActions must include at least one entry" },
            { status: 400 },
        );
    }

    const validActions = Object.values(SyncAction);
    const validEmulators = Object.values(Emulator);

    const actions = body.emulatorActions as EmulatorActionEntry[];
    for (const entry of actions) {
        const { emulator, action } = entry ?? ({} as EmulatorActionEntry);
        if (!validEmulators.includes(emulator as Emulator)) {
            return Response.json(
                {
                    error: `Invalid emulator '${emulator}'. Must be one of: ${validEmulators.join(", ")}`,
                },
                { status: 400 },
            );
        }
        if (!validActions.includes(action as SyncAction)) {
            return Response.json(
                {
                    error: `Invalid action '${action}' for emulator '${emulator}'. Must be one of: ${validActions.join(", ")}`,
                },
                { status: 400 },
            );
        }
    }

    // Find device by name
    const emuDevices = getEmuDevices();
    const device = emuDevices.find((d) => d.name === body.deviceName);
    if (!device) {
        return Response.json(
            { error: `Device '${body.deviceName}' not found` },
            { status: 404 },
        );
    }

    // Generate a job id
    const id = randomUUID();

    // Run connection test
    const canConnect = await connectionTest(device);

    if (!canConnect) {
        const failedRecord: DeviceSyncRecord = {
            deviceSyncRequest: {
                deviceName: body.deviceName,
                emulatorActions: actions,
            },
            status: SyncStatus.FAILED,
            output: ["Connection test failed"],
        };
        const response: DeviceSyncResponse = {
            id,
            deviceSyncRecord: failedRecord,
        };
        return Response.json(response);
    }

    const inProgressRecord: DeviceSyncRecord = {
        deviceSyncRequest: {
            deviceName: body.deviceName,
            emulatorActions: actions,
        },
        status: SyncStatus.IN_PROGRESS,
        output: [],
    };

    // Ensure server info is available
    const emuServer = getEmuServer();
    if (!emuServer) {
        return Response.json(
            { error: "Server info not initialized" },
            { status: 500 },
        );
    }

    // Store the record in Redis keyed by the job id
    await setJSON(id, inProgressRecord);

    // Kick off the sync job asynchronously; update Redis on completion
    (async () => {
        try {
            const logs = await runDeviceSync(
                inProgressRecord.deviceSyncRequest,
                device,
                emuServer,
                { jobId: id },
            );
            const existing =
                (await getJSON<DeviceSyncRecord>(id)) ?? inProgressRecord;
            const completeRecord: DeviceSyncRecord = {
                ...existing,
                status: SyncStatus.COMPLETE,
                output: [...(existing.output ?? []), ...logs],
            };
            await setJSON(id, completeRecord);
        } catch (err) {
            const existing =
                (await getJSON<DeviceSyncRecord>(id)) ?? inProgressRecord;
            const failed: DeviceSyncRecord = {
                ...existing,
                status: SyncStatus.FAILED,
                output: [
                    ...(existing.output ?? []),
                    `error:${(err as Error)?.message ?? String(err)}`,
                ],
            };
            await setJSON(id, failed);
        }
    })().catch((e) => console.error("Sync job error:", e));

    const response: DeviceSyncResponse = {
        id,
        deviceSyncRecord: inProgressRecord,
    };
    return Response.json(response);
}
