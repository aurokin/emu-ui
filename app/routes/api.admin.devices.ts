import { getRawDevices, addDevice } from "~/server/database";

// GET /api/admin/devices - Returns all devices (full config)
export async function loader() {
    const devices = await getRawDevices();
    return Response.json(devices);
}

// POST /api/admin/devices - Add a new device
export async function action({ request }: { request: Request }) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const device = (await request.json()) as Record<string, unknown>;

    // Validate required fields
    const requiredFields = ["name", "ip", "port", "user", "password", "os", "workDir"];
    for (const field of requiredFields) {
        if (!device[field]) {
            return Response.json(
                { error: `Missing required field: ${field}` },
                { status: 400 },
            );
        }
    }

    const result = await addDevice(device);

    if (!result.success) {
        return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true }, { status: 201 });
}
