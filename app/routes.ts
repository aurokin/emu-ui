import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("admin", "routes/admin.tsx"),
    // API routes
    route("api/devices", "routes/api.devices.ts"),
    route("api/device-sync", "routes/api.device-sync.ts"),
    route("api/device-sync/:id", "routes/api.device-sync.$id.ts"),
    // Admin API routes
    route("api/admin", "routes/api.admin.ts"),
    route("api/admin/devices", "routes/api.admin.devices.ts"),
    route("api/admin/devices/:name", "routes/api.admin.devices.$name.ts"),
] satisfies RouteConfig;
