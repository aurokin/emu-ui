import type { LoaderFunctionArgs } from "react-router";
import type { DeviceSyncRecord, DeviceSyncResponse } from "~/server/types";
import { initializeServer } from "~/server";
import { getJSON } from "~/server/redis";

// GET /api/device-sync/:id - Polls sync job status
export async function loader({ params }: LoaderFunctionArgs) {
    await initializeServer();

    const id = params.id;
    if (!id) {
        return Response.json({ error: "Missing id param" }, { status: 400 });
    }

    try {
        const record = await getJSON<DeviceSyncRecord>(id);
        if (!record) {
            return Response.json(
                { error: `Record '${id}' not found` },
                { status: 404 }
            );
        }
        const response: DeviceSyncResponse = { id, deviceSyncRecord: record };
        return Response.json(response);
    } catch (err) {
        console.error("Failed to retrieve record:", err);
        return Response.json(
            { error: "Failed to retrieve record" },
            { status: 500 }
        );
    }
}
