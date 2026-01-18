import type { Route } from "./+types/home";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import ComputerIcon from "@mui/icons-material/Computer";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import TerminalIcon from "@mui/icons-material/Terminal";
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
    const iconSx = {
        fontSize: 20,
        color: "#00ffff",
        filter: "drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))",
    };

    if (osLower.includes("android")) {
        return <AndroidIcon sx={iconSx} />;
    } else if (osLower.includes("ios")) {
        return <PhoneIphoneIcon sx={iconSx} />;
    } else if (osLower.includes("windows")) {
        return <DesktopWindowsIcon sx={iconSx} />;
    } else if (osLower.includes("mac") || osLower.includes("darwin")) {
        return <AppleIcon sx={iconSx} />;
    } else if (osLower.includes("linux")) {
        return <TerminalIcon sx={iconSx} />;
    } else {
        return <ComputerIcon sx={iconSx} />;
    }
}

function TerminalLoader() {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#00ff41",
            }}
        >
            <Box
                component="span"
                sx={{
                    display: "inline-flex",
                    gap: "4px",
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 8,
                            height: 8,
                            backgroundColor: "#00ff41",
                            animation: "loader-pulse 1.4s ease-in-out infinite",
                            animationDelay: `${i * 0.2}s`,
                            "@keyframes loader-pulse": {
                                "0%, 80%, 100%": {
                                    transform: "scale(0.6)",
                                    opacity: 0.4,
                                },
                                "40%": {
                                    transform: "scale(1)",
                                    opacity: 1,
                                    boxShadow: "0 0 10px #00ff41",
                                },
                            },
                        }}
                    />
                ))}
            </Box>
            <Typography
                variant="caption"
                sx={{
                    color: "#00ff41",
                    letterSpacing: "0.1em",
                    fontSize: "0.7rem",
                }}
            >
                LOADING...
            </Typography>
        </Box>
    );
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
            {/* Terminal Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#00ffff",
                            letterSpacing: "0.15em",
                            fontSize: "0.65rem",
                        }}
                    >
                        SYSTEM://
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                            color: "#00ff41",
                            textShadow: "0 0 20px rgba(0, 255, 65, 0.5)",
                            letterSpacing: "0.05em",
                        }}
                    >
                        DEVICE_SELECT
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            color: "#00ff41",
                            opacity: 0.7,
                        }}
                    >
                        {">"}
                    </Box>
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.8rem",
                            letterSpacing: "0.02em",
                        }}
                    >
                        Select a device to configure emulator sync actions
                    </Typography>
                </Box>
            </Box>

            {/* Loading State */}
            {loading && <TerminalLoader />}

            {/* Error State */}
            {error && (
                <Box
                    sx={{
                        p: 2,
                        border: "1px solid #ff3366",
                        backgroundColor: "rgba(255, 51, 102, 0.05)",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#ff3366",
                            fontSize: "0.8rem",
                            fontFamily: "monospace",
                        }}
                    >
                        ERROR: {error}
                    </Typography>
                </Box>
            )}

            {/* Empty State */}
            {!loading && !error && devices.length === 0 && (
                <Box
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                    }}
                >
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.8rem",
                            letterSpacing: "0.1em",
                        }}
                    >
                        NO DEVICES FOUND
                    </Typography>
                </Box>
            )}

            {/* Device Grid */}
            {!loading && !error && devices.length > 0 && (
                <Box
                    sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                    }}
                >
                    {devices.map((device) => {
                        const isSelected = selectedDevice === device.name;
                        return (
                            <Box
                                key={device.name}
                                onClick={() => {
                                    if (requestInProgress) return;
                                    setSelectedDevice(
                                        isSelected ? null : device.name,
                                    );
                                }}
                                sx={{
                                    cursor: requestInProgress
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: requestInProgress && !isSelected ? 0.5 : 1,
                                    position: "relative",
                                    backgroundColor: isSelected
                                        ? "rgba(0, 255, 65, 0.03)"
                                        : "rgba(18, 18, 26, 0.6)",
                                    border: "1px solid",
                                    borderColor: isSelected
                                        ? "#00ff41"
                                        : "#1a1a24",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: requestInProgress
                                            ? undefined
                                            : isSelected
                                            ? "#00ff41"
                                            : "rgba(0, 255, 65, 0.4)",
                                        backgroundColor: requestInProgress
                                            ? undefined
                                            : isSelected
                                            ? "rgba(0, 255, 65, 0.05)"
                                            : "rgba(18, 18, 26, 0.8)",
                                    },
                                    ...(isSelected && {
                                        boxShadow:
                                            "0 0 20px rgba(0, 255, 65, 0.15), inset 0 0 30px rgba(0, 255, 65, 0.03)",
                                    }),
                                }}
                            >
                                {/* Terminal window header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        px: 1.5,
                                        py: 0.75,
                                        borderBottom: "1px solid",
                                        borderColor: isSelected
                                            ? "rgba(0, 255, 65, 0.2)"
                                            : "#1a1a24",
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    }}
                                >
                                    {/* Window controls - pixel style */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: "4px",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                backgroundColor: isSelected
                                                    ? "#00ff41"
                                                    : "#1a1a24",
                                                boxShadow: isSelected
                                                    ? "0 0 4px #00ff41"
                                                    : "none",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                backgroundColor: "#1a1a24",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                backgroundColor: "#1a1a24",
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: isSelected
                                                ? "#00ff41"
                                                : "text.secondary",
                                            fontSize: "0.6rem",
                                            letterSpacing: "0.1em",
                                            ml: "auto",
                                        }}
                                    >
                                        {isSelected ? "SELECTED" : "DEVICE"}
                                    </Typography>
                                </Box>

                                {/* Device Content */}
                                <Box sx={{ p: 2 }}>
                                    {/* Device name with icon */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            mb: 1.5,
                                        }}
                                    >
                                        {getDeviceIcon(device.os)}
                                        <Typography
                                            sx={{
                                                fontSize: "0.9rem",
                                                fontWeight: 600,
                                                color: isSelected
                                                    ? "#00ff41"
                                                    : "text.primary",
                                                letterSpacing: "0.02em",
                                            }}
                                        >
                                            {device.name}
                                        </Typography>
                                    </Box>

                                    {/* OS Info */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#00ffff",
                                                fontSize: "0.6rem",
                                                letterSpacing: "0.1em",
                                            }}
                                        >
                                            OS:
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            {capitalize(device.os)}
                                        </Typography>
                                    </Box>

                                    {/* Emulators */}
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#00ffff",
                                                fontSize: "0.6rem",
                                                letterSpacing: "0.1em",
                                                display: "block",
                                                mb: 1,
                                            }}
                                        >
                                            EMULATORS:
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 0.75,
                                            }}
                                        >
                                            {device.emulatorsEnabled.map(
                                                (e) => (
                                                    <Box
                                                        key={e}
                                                        sx={{
                                                            px: 1,
                                                            py: 0.25,
                                                            fontSize: "0.65rem",
                                                            fontFamily:
                                                                "monospace",
                                                            letterSpacing:
                                                                "0.05em",
                                                            textTransform:
                                                                "uppercase",
                                                            border: "1px solid",
                                                            borderColor:
                                                                isSelected
                                                                    ? "#00ff41"
                                                                    : "#00ffff",
                                                            color: isSelected
                                                                ? "#00ff41"
                                                                : "#00ffff",
                                                            backgroundColor:
                                                                isSelected
                                                                    ? "rgba(0, 255, 65, 0.05)"
                                                                    : "rgba(0, 255, 255, 0.05)",
                                                        }}
                                                    >
                                                        {capitalize(e)}
                                                    </Box>
                                                ),
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Selection indicator line */}
                                {isSelected && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: "2px",
                                            background:
                                                "linear-gradient(90deg, transparent 0%, #00ff41 50%, transparent 100%)",
                                            boxShadow: "0 0 10px #00ff41",
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            <EmulatorActionForm />
        </Container>
    );
}
