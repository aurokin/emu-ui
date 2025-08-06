import type { Route } from "./+types/home";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import ComputerIcon from "@mui/icons-material/Computer";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PetsIcon from "@mui/icons-material/Pets";
import { useDevices } from "~/contexts/DeviceContext";
import { EmulatorActionForm } from "~/components/EmulatorActionForm";

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "EmuSync" },
        {
            name: "description",
            content:
                "Application for syncing emulation save games with the server or the device!",
        },
    ];
}

function getDeviceIcon(os: string) {
    const osLower = os.toLowerCase();
    if (osLower.includes("android")) {
        return <AndroidIcon sx={{ fontSize: 24, color: "primary.main" }} />;
    } else if (osLower.includes("ios")) {
        return <PhoneIphoneIcon sx={{ fontSize: 24, color: "primary.main" }} />;
    } else if (osLower.includes("windows")) {
        return (
            <DesktopWindowsIcon sx={{ fontSize: 24, color: "primary.main" }} />
        );
    } else if (osLower.includes("mac") || osLower.includes("darwin")) {
        return <AppleIcon sx={{ fontSize: 24, color: "primary.main" }} />;
    } else if (osLower.includes("linux")) {
        return <PetsIcon sx={{ fontSize: 24, color: "primary.main" }} />;
    } else {
        return <ComputerIcon sx={{ fontSize: 24, color: "primary.main" }} />;
    }
}

export default function Home() {
    const { devices, loading, error, selectedDevice, setSelectedDevice } =
        useDevices();

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h1" gutterBottom>
                EmuSync
            </Typography>
            <Typography variant="h2" gutterBottom>
                Devices
            </Typography>

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
                <Box
                    sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                    }}
                >
                    {devices.map((device) => (
                        <Card
                            key={device.name}
                            sx={{
                                border: "2px solid",
                                borderColor:
                                    selectedDevice === device.name
                                        ? "primary.main"
                                        : "transparent",
                                display: "flex",
                                height: "auto",
                            }}
                        >
                            <CardContent
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 1,
                                    }}
                                >
                                    {getDeviceIcon(device.os)}
                                    <Typography variant="h6" component="h3">
                                        {device.name}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    OS: {capitalize(device.os)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Emulators Enabled:{" "}
                                    {device.emulatorsEnabled
                                        .map(capitalize)
                                        .join(", ")}
                                </Typography>
                            </CardContent>
                            <Button
                                variant={
                                    selectedDevice === device.name
                                        ? "contained"
                                        : "outlined"
                                }
                                onClick={() =>
                                    setSelectedDevice(
                                        selectedDevice === device.name
                                            ? null
                                            : device.name,
                                    )
                                }
                                sx={{
                                    minWidth: "60px",
                                    borderRadius: 0,
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                }}
                            >
                                <ArrowForwardIcon />
                            </Button>
                        </Card>
                    ))}
                </Box>
            )}

            <EmulatorActionForm />
        </Box>
    );
}
