import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import type { Device } from "~/types/device";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('/api/devices');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDevices(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch devices');
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h1" gutterBottom>Home</Typography>
            <Typography variant="h2" gutterBottom>Devices</Typography>

            {loading && <CircularProgress />}

            {error && (
                <Typography color="error" variant="body1">
                    Error loading devices: {error}
                </Typography>
            )}

            {!loading && !error && devices.length === 0 && (
                <Typography variant="body1">No devices found.</Typography>
            )}

            {!loading && !error && devices.length > 0 && (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {devices.map((device) => (
                        <Card key={device.name}>
                            <CardContent>
                                <Typography variant="h6" component="h3">
                                    {device.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    OS: {device.os}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Emulators Enabled: {device.emulatorsEnabled.join(", ")}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}
