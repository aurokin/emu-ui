import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // API routes
    route("api/devices", "routes/api.devices.ts"),
    route("api/device-sync", "routes/api.device-sync.ts"),
    route("api/device-sync/:id", "routes/api.device-sync.$id.ts"),
] satisfies RouteConfig;
