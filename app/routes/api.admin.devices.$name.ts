import { getDevice, updateDevice, deleteDevice } from "~/server/database";

type RouteParams = {
    params: {
        name: string;
    };
};

// GET /api/admin/devices/:name - Returns a single device
export async function loader({ params }: RouteParams) {
    const device = await getDevice(params.name);
    if (!device) {
        return Response.json({ error: "Device not found" }, { status: 404 });
    }
    return Response.json(device);
}

// PUT/DELETE /api/admin/devices/:name - Update or delete a device
export async function action({
    request,
    params,
}: { request: Request } & RouteParams) {
    const { name } = params;

    if (request.method === "PUT") {
        const updates = (await request.json()) as Record<string, unknown>;
        const result = await updateDevice(name, updates);

        if (!result.success) {
            return Response.json({ error: result.error }, { status: 400 });
        }

        return Response.json({ success: true });
    }

    if (request.method === "DELETE") {
        const result = await deleteDevice(name);

        if (!result.success) {
            return Response.json({ error: result.error }, { status: 404 });
        }

        return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
}
