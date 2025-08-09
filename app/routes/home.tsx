import type { Route } from "./+types/home";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import ComputerIcon from "@mui/icons-material/Computer";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PetsIcon from "@mui/icons-material/Pets";
import { useDevices } from "~/contexts/DeviceContext";
import { EmulatorActionForm } from "~/components/EmulatorActionForm";
import { capitalize } from "~/utilities/utils";

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
    const {
        devices,
        loading,
        error,
        selectedDevice,
        setSelectedDevice,
        requestInProgress,
    } = useDevices();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: -0.5,
                        background: (theme) =>
                            `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    EmuSync
                </Typography>
                <Typography color="text.secondary">
                    Select a device to manage emulator sync actions.
                </Typography>
            </Box>

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
                        gap: 2.5,
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(320px, 1fr))",
                    }}
                >
                    {devices.map((device) => {
                        const isSelected = selectedDevice === device.name;
                        return (
                            <Card
                                key={device.name}
                                sx={{
                                    position: "relative",
                                    border: isSelected
                                        ? "2px solid"
                                        : "1px solid",
                                    borderColor: isSelected
                                        ? "primary.main"
                                        : "divider",
                                    overflow: "hidden",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                <CardActionArea
                                    aria-disabled={requestInProgress}
                                    onClick={() => {
                                        if (requestInProgress) return;
                                        setSelectedDevice(
                                            isSelected ? null : device.name,
                                        );
                                    }}
                                >
                                    <CardContent>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{ mb: 1 }}
                                        >
                                            {getDeviceIcon(device.os)}
                                            <Typography
                                                variant="h6"
                                                component="h3"
                                            >
                                                {device.name}
                                            </Typography>
                                        </Stack>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            OS: {capitalize(device.os)}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ mt: 1, flexWrap: "wrap" }}
                                        >
                                            {device.emulatorsEnabled.map(
                                                (e) => (
                                                    <Chip
                                                        key={e}
                                                        size="small"
                                                        label={capitalize(e)}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ),
                                            )}
                                        </Stack>
                                    </CardContent>
                                </CardActionArea>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    <Button
                                        size="small"
                                        variant={
                                            isSelected
                                                ? "contained"
                                                : "outlined"
                                        }
                                        endIcon={<ArrowForwardIcon />}
                                        disabled={requestInProgress}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (requestInProgress) return;
                                            setSelectedDevice(
                                                isSelected ? null : device.name,
                                            );
                                        }}
                                    >
                                        {isSelected ? "Selected" : "Select"}
                                    </Button>
                                </Box>
                            </Card>
                        );
                    })}
                </Box>
            )}

            <EmulatorActionForm />
        </Container>
    );
}
