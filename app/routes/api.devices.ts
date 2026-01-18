import { initializeServer, getSimpleDevices } from "~/server";

// GET /api/devices - Returns list of available devices
export async function loader() {
    await initializeServer();
    const devices = getSimpleDevices();
    return Response.json(devices);
}
