import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDevices } from "~/contexts/DeviceContext";
import type { EmulatorAction } from "~/types/emulatorAction";
import type { DeviceSyncRequest, DeviceSyncResponse } from "~/types/device";
import { SyncStatus } from "~/types/device";
import { capitalize } from "~/utilities/utils";

function TerminalLoader() {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: 6,
                        height: 6,
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
    );
}

export function EmulatorActionForm() {
    const {
        devices,
        selectedDevice,
        emulatorActions,
        setEmulatorActions,
        deviceSyncResponse,
        setDeviceSyncResponse,
        requestInProgress,
        setRequestInProgress,
    } = useDevices();

    const selectedDeviceData = devices.find(
        (device) => device.name === selectedDevice,
    );

    useEffect(() => {
        if (selectedDeviceData) {
            const defaultActions: { [key: string]: EmulatorAction } = {};
            selectedDeviceData.emulatorsEnabled.forEach((emulator) => {
                defaultActions[emulator] = "ignore";
            });
            setEmulatorActions(defaultActions);
        }
        setDeviceSyncResponse(null);
        setRequestInProgress(false);
    }, [selectedDevice, selectedDeviceData, setEmulatorActions]);

    const handleActionChange = (emulator: string, action: EmulatorAction) => {
        setEmulatorActions({
            ...emulatorActions,
            [emulator]: action,
        });
    };

    const handleSubmit = async () => {
        const payload: DeviceSyncRequest = {
            deviceName: selectedDeviceData!.name,
            emulatorActions: Object.entries(emulatorActions)
                .filter(([, action]) => action !== "ignore")
                .map(([emulator, action]) => ({ emulator, action })),
        };

        try {
            setDeviceSyncResponse(null);
            setRequestInProgress(true);
            const res = await fetch("/api/device-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = (await res.json()) as DeviceSyncResponse;
            setDeviceSyncResponse(data);
        } catch (err) {
            console.error("Failed to request device sync", err);
            setRequestInProgress(false);
        }
    };

    useEffect(() => {
        if (
            deviceSyncResponse &&
            deviceSyncResponse.deviceSyncRecord.status === SyncStatus.IN_PROGRESS
        ) {
            const id = deviceSyncResponse.id;
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/device-sync/${id}`);
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }
                    const data = (await res.json()) as DeviceSyncResponse;
                    setDeviceSyncResponse(data);
                    if (
                        data.deviceSyncRecord.status !== SyncStatus.IN_PROGRESS
                    ) {
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling device sync failed", e);
                    clearInterval(interval);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [
        deviceSyncResponse?.id,
        deviceSyncResponse?.deviceSyncRecord.status,
        setDeviceSyncResponse,
    ]);

    useEffect(() => {
        if (!deviceSyncResponse) return;
        if (
            deviceSyncResponse.deviceSyncRecord.status !==
            SyncStatus.IN_PROGRESS
        ) {
            setRequestInProgress(false);
        }
    }, [deviceSyncResponse?.deviceSyncRecord.status, setRequestInProgress]);

    if (!selectedDevice || !selectedDeviceData) {
        return null;
    }

    const hasActions = selectedDeviceData.emulatorsEnabled.some(
        (emu) =>
            emulatorActions[emu] === "push" || emulatorActions[emu] === "pull",
    );

    return (
        <Box
            sx={{
                mt: 4,
                border: "1px solid #1a1a24",
                backgroundColor: "rgba(18, 18, 26, 0.8)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Top glow line */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                        "linear-gradient(90deg, transparent 0%, #00ff41 20%, #00ffff 50%, #00ff41 80%, transparent 100%)",
                    opacity: 0.5,
                }}
            />

            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #1a1a24",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "#00ffff",
                        letterSpacing: "0.15em",
                        fontSize: "0.6rem",
                    }}
                >
                    CONFIG://
                </Typography>
                <Typography
                    sx={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: "0.7rem",
                        color: "#00ff41",
                        textShadow: "0 0 10px rgba(0, 255, 65, 0.5)",
                        letterSpacing: "0.05em",
                    }}
                >
                    SYNC_ACTIONS
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.7rem",
                        letterSpacing: "0.05em",
                    }}
                >
                    {selectedDeviceData.name}
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                {/* Instructions */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Box sx={{ color: "#00ff41", opacity: 0.7 }}>{">"}</Box>
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.75rem",
                            letterSpacing: "0.02em",
                        }}
                    >
                        Configure sync action for each emulator
                    </Typography>
                </Box>

                {/* Emulator Actions Grid */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {selectedDeviceData.emulatorsEnabled.map((emulator) => (
                        <Box
                            key={emulator}
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "stretch", sm: "center" },
                                gap: 2,
                                p: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid #1a1a24",
                            }}
                        >
                            {/* Emulator name */}
                            <Box
                                sx={{
                                    minWidth: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 4,
                                        height: 4,
                                        backgroundColor:
                                            emulatorActions[emulator] ===
                                            "ignore"
                                                ? "#1a1a24"
                                                : emulatorActions[emulator] ===
                                                  "push"
                                                ? "#00ff41"
                                                : "#00ffff",
                                        boxShadow:
                                            emulatorActions[emulator] !==
                                            "ignore"
                                                ? `0 0 6px ${
                                                      emulatorActions[
                                                          emulator
                                                      ] === "push"
                                                          ? "#00ff41"
                                                          : "#00ffff"
                                                  }`
                                                : "none",
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color:
                                            emulatorActions[emulator] ===
                                            "ignore"
                                                ? "text.secondary"
                                                : "#00ffff",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {capitalize(emulator)}
                                </Typography>
                            </Box>

                            {/* Action buttons */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                }}
                            >
                                {(
                                    ["ignore", "push", "pull"] as EmulatorAction[]
                                ).map((action) => {
                                    const isSelected =
                                        emulatorActions[emulator] === action;
                                    const actionColors = {
                                        ignore: {
                                            border: "#3a3a4a",
                                            bg: "rgba(58, 58, 74, 0.2)",
                                            color: "#888899",
                                        },
                                        push: {
                                            border: "#00ff41",
                                            bg: "rgba(0, 255, 65, 0.1)",
                                            color: "#00ff41",
                                        },
                                        pull: {
                                            border: "#00ffff",
                                            bg: "rgba(0, 255, 255, 0.1)",
                                            color: "#00ffff",
                                        },
                                    };
                                    const colors = actionColors[action];

                                    return (
                                        <Box
                                            key={action}
                                            onClick={() =>
                                                handleActionChange(
                                                    emulator,
                                                    action,
                                                )
                                            }
                                            sx={{
                                                px: 2,
                                                py: 0.75,
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: isSelected
                                                    ? colors.border
                                                    : "#1a1a24",
                                                backgroundColor: isSelected
                                                    ? colors.bg
                                                    : "transparent",
                                                color: isSelected
                                                    ? colors.color
                                                    : "text.secondary",
                                                fontSize: "0.7rem",
                                                fontFamily: "monospace",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    borderColor: colors.border,
                                                    backgroundColor:
                                                        action === "ignore"
                                                            ? "rgba(58, 58, 74, 0.3)"
                                                            : colors.bg,
                                                },
                                                ...(isSelected &&
                                                    action !== "ignore" && {
                                                        boxShadow: `0 0 10px ${colors.border}40`,
                                                    }),
                                            }}
                                        >
                                            {action}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Divider */}
                <Box
                    sx={{
                        my: 3,
                        height: "1px",
                        background:
                            "linear-gradient(90deg, transparent 0%, #1a1a24 20%, #1a1a24 80%, transparent 100%)",
                    }}
                />

                {/* Action buttons */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1.5,
                    }}
                >
                    <Box
                        component="button"
                        onClick={() => {
                            const resetActions: { [key: string]: EmulatorAction } = {};
                            selectedDeviceData.emulatorsEnabled.forEach((emulator) => {
                                resetActions[emulator] = "ignore";
                            });
                            setEmulatorActions(resetActions);
                        }}
                        disabled={requestInProgress || !hasActions}
                        sx={{
                            px: 2,
                            py: 1,
                            border: "1px solid",
                            borderColor:
                                requestInProgress || !hasActions
                                    ? "#1a1a24"
                                    : "#3a3a4a",
                            backgroundColor: "transparent",
                            color:
                                requestInProgress || !hasActions
                                    ? "#3a3a4a"
                                    : "#888899",
                            fontSize: "0.75rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 500,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor:
                                requestInProgress || !hasActions
                                    ? "not-allowed"
                                    : "pointer",
                            transition: "all 0.2s ease",
                            "&:hover:not(:disabled)": {
                                borderColor: "#888899",
                                color: "#e0e0e0",
                            },
                        }}
                    >
                        RESET
                    </Box>
                    <Box
                        component="button"
                        onClick={handleSubmit}
                        disabled={requestInProgress || !hasActions}
                        sx={{
                            px: 3,
                            py: 1,
                            border: "1px solid",
                            borderColor:
                                requestInProgress || !hasActions
                                    ? "#1a1a24"
                                    : "#00ff41",
                            backgroundColor:
                                requestInProgress || !hasActions
                                    ? "transparent"
                                    : "#00ff41",
                            color:
                                requestInProgress || !hasActions
                                    ? "text.secondary"
                                    : "#0a0a0c",
                            fontSize: "0.75rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor:
                                requestInProgress || !hasActions
                                    ? "not-allowed"
                                    : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            "&:hover:not(:disabled)": {
                                boxShadow:
                                    "0 0 15px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.3)",
                            },
                        }}
                    >
                        {requestInProgress ? (
                            <>
                                <TerminalLoader />
                                <span>SYNCING</span>
                            </>
                        ) : (
                            "EXECUTE SYNC"
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Response Section */}
            {deviceSyncResponse && (
                <Box
                    sx={{
                        borderTop: "1px solid #1a1a24",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                    }}
                >
                    {/* Response Header */}
                    <Box
                        sx={{
                            px: 2,
                            py: 1,
                            borderBottom: "1px solid #1a1a24",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#00ffff",
                                letterSpacing: "0.15em",
                                fontSize: "0.6rem",
                            }}
                        >
                            RESPONSE://
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    backgroundColor:
                                        deviceSyncResponse.deviceSyncRecord
                                            .status === SyncStatus.IN_PROGRESS
                                            ? "#ffb000"
                                            : deviceSyncResponse.deviceSyncRecord
                                                  .status === SyncStatus.COMPLETE
                                            ? "#00ff41"
                                            : "#ff3366",
                                    boxShadow: `0 0 6px ${
                                        deviceSyncResponse.deviceSyncRecord
                                            .status === SyncStatus.IN_PROGRESS
                                            ? "#ffb000"
                                            : deviceSyncResponse.deviceSyncRecord
                                                  .status === SyncStatus.COMPLETE
                                            ? "#00ff41"
                                            : "#ff3366"
                                    }`,
                                    animation:
                                        deviceSyncResponse.deviceSyncRecord
                                            .status === SyncStatus.IN_PROGRESS
                                            ? "pulse-glow 1s ease-in-out infinite"
                                            : "none",
                                    "@keyframes pulse-glow": {
                                        "0%, 100%": { opacity: 1 },
                                        "50%": { opacity: 0.5 },
                                    },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.1em",
                                    color:
                                        deviceSyncResponse.deviceSyncRecord
                                            .status === SyncStatus.IN_PROGRESS
                                            ? "#ffb000"
                                            : deviceSyncResponse.deviceSyncRecord
                                                  .status === SyncStatus.COMPLETE
                                            ? "#00ff41"
                                            : "#ff3366",
                                }}
                            >
                                {deviceSyncResponse.deviceSyncRecord.status}
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.6rem",
                                fontFamily: "monospace",
                            }}
                        >
                            ID: {deviceSyncResponse.id}
                        </Typography>
                    </Box>

                    {/* Response Content */}
                    <Box sx={{ p: 2 }}>
                        {/* Actions list */}
                        <Box sx={{ mb: 2 }}>
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
                                EXECUTED ACTIONS:
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                {deviceSyncResponse.deviceSyncRecord.deviceSyncRequest.emulatorActions.map(
                                    (item) => (
                                        <Box
                                            key={item.emulator}
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                border: "1px solid",
                                                borderColor:
                                                    item.action === "push"
                                                        ? "#00ff41"
                                                        : "#00ffff",
                                                color:
                                                    item.action === "push"
                                                        ? "#00ff41"
                                                        : "#00ffff",
                                                fontSize: "0.65rem",
                                                fontFamily: "monospace",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {capitalize(item.emulator)}:{" "}
                                            {item.action.toUpperCase()}
                                        </Box>
                                    ),
                                )}
                            </Box>
                        </Box>

                        {/* Output */}
                        {deviceSyncResponse.deviceSyncRecord.output?.length ? (
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
                                    OUTPUT:
                                </Typography>
                                <Box
                                    component="pre"
                                    sx={{
                                        m: 0,
                                        p: 2,
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                        border: "1px solid #1a1a24",
                                        fontSize: "0.7rem",
                                        fontFamily: '"JetBrains Mono", monospace',
                                        lineHeight: 1.6,
                                        color: "#00cc33",
                                        overflowX: "auto",
                                        maxHeight: 300,
                                        "&::-webkit-scrollbar": {
                                            width: 6,
                                            height: 6,
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            backgroundColor: "#0a0a0c",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#1a1a24",
                                        },
                                    }}
                                >
                                    {deviceSyncResponse.deviceSyncRecord.output.join(
                                        "\n",
                                    )}
                                </Box>
                            </Box>
                        ) : null}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
