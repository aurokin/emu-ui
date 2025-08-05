import type { Route } from "./+types/home";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDevices } from "~/contexts/DeviceContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EmuSync" },
        { name: "description", content: "Application for syncing emulation save games with the server or the device!" },
    ];
}

export default function Home() {
    const { devices, loading, error, selectedDevice, setSelectedDevice } = useDevices();

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
                        <Card
                            key={device.name}
                            sx={{
                                border: '2px solid',
                                borderColor: selectedDevice === device.name ? 'primary.main' : 'transparent',
                                display: 'flex',
                                height: 'auto'
                            }}
                        >
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                            <Button
                                variant={selectedDevice === device.name ? "contained" : "outlined"}
                                onClick={() => setSelectedDevice(selectedDevice === device.name ? null : device.name)}
                                sx={{
                                    minWidth: '60px',
                                    borderRadius: 0,
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0
                                }}
                            >
                                <ArrowForwardIcon />
                            </Button>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}
