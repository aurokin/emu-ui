import { useEffect, useRef } from "react";
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
                        borderRadius: 999,
                        backgroundColor: "#f6c177",
                        animation: "loader-bounce 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                        "@keyframes loader-bounce": {
                            "0%, 100%": {
                                transform: "scale(0.8)",
                                opacity: 0.4,
                            },
                            "50%": {
                                transform: "scale(1)",
                                opacity: 1,
                                boxShadow: "0 0 10px rgba(246, 193, 119, 0.6)",
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

    const outputRef = useRef<HTMLPreElement | null>(null);

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
            deviceSyncResponse.deviceSyncRecord.status ===
                SyncStatus.IN_PROGRESS
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

    useEffect(() => {
        if (!outputRef.current) return;
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [deviceSyncResponse?.deviceSyncRecord.output?.length]);

    if (!selectedDevice || !selectedDeviceData) {
        return null;
    }

    const hasActions = selectedDeviceData.emulatorsEnabled.some(
        (emu) =>
            emulatorActions[emu] === "push" || emulatorActions[emu] === "pull",
    );
    const isActionDisabled = requestInProgress || !hasActions;
    const isResetDisabled =
        !deviceSyncResponse ||
        deviceSyncResponse.deviceSyncRecord.status === SyncStatus.IN_PROGRESS;
    const statusColor = deviceSyncResponse
        ? deviceSyncResponse.deviceSyncRecord.status === SyncStatus.IN_PROGRESS
            ? "#f6c177"
            : deviceSyncResponse.deviceSyncRecord.status === SyncStatus.COMPLETE
              ? "#4fd1c5"
              : "#f28fad"
        : "#7aa2f7";

    return (
        <Box
            sx={{
                mt: 4,
                border: "1px solid rgba(122, 162, 247, 0.2)",
                borderRadius: "18px",
                backgroundColor: "rgba(17, 24, 37, 0.84)",
                boxShadow: "0 18px 40px rgba(6, 9, 16, 0.35)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(79, 209, 197, 0.7) 30%, rgba(122, 162, 247, 0.7) 70%, transparent 100%)",
                }}
            />

            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid rgba(122, 162, 247, 0.2)",
                    backgroundColor: "rgba(12, 16, 27, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "#7aa2f7",
                        letterSpacing: "0.2em",
                        fontSize: "0.65rem",
                    }}
                >
                    CONFIGURATION
                </Typography>
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                    }}
                >
                    Sync actions
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    {selectedDeviceData.name}
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: "#7aa2f7",
                        }}
                    />
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.85rem",
                        }}
                    >
                        Configure sync behavior for each emulator before running
                        the transfer.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {selectedDeviceData.emulatorsEnabled.map((emulator) => {
                        const indicatorColor =
                            emulatorActions[emulator] === "ignore"
                                ? "rgba(169, 178, 199, 0.5)"
                                : emulatorActions[emulator] === "push"
                                  ? "#f6c177"
                                  : "#7aa2f7";
                        const actionColors = {
                            ignore: {
                                border: "rgba(169, 178, 199, 0.4)",
                                bg: "rgba(169, 178, 199, 0.12)",
                                color: "#a9b2c7",
                                shadow: "rgba(169, 178, 199, 0.2)",
                            },
                            push: {
                                border: "rgba(246, 193, 119, 0.6)",
                                bg: "rgba(246, 193, 119, 0.18)",
                                color: "#f6c177",
                                shadow: "rgba(246, 193, 119, 0.35)",
                            },
                            pull: {
                                border: "rgba(122, 162, 247, 0.6)",
                                bg: "rgba(122, 162, 247, 0.18)",
                                color: "#7aa2f7",
                                shadow: "rgba(122, 162, 247, 0.35)",
                            },
                        };

                        return (
                            <Box
                                key={emulator}
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    alignItems: {
                                        xs: "stretch",
                                        sm: "center",
                                    },
                                    gap: 2,
                                    p: 2,
                                    borderRadius: "14px",
                                    backgroundColor: "rgba(10, 14, 22, 0.6)",
                                    border: "1px solid rgba(122, 162, 247, 0.15)",
                                }}
                            >
                                <Box
                                    sx={{
                                        minWidth: 140,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            backgroundColor: indicatorColor,
                                            boxShadow:
                                                indicatorColor ===
                                                "rgba(169, 178, 199, 0.5)"
                                                    ? "none"
                                                    : `0 0 12px ${indicatorColor}`,
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            color:
                                                emulatorActions[emulator] ===
                                                "ignore"
                                                    ? "text.secondary"
                                                    : "text.primary",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            letterSpacing: "0.06em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {capitalize(emulator)}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {(
                                        [
                                            "ignore",
                                            "push",
                                            "pull",
                                        ] as EmulatorAction[]
                                    ).map((action) => {
                                        const isSelected =
                                            emulatorActions[emulator] ===
                                            action;
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
                                                    py: 0.7,
                                                    cursor: "pointer",
                                                    borderRadius: 999,
                                                    border: "1px solid",
                                                    borderColor: isSelected
                                                        ? colors.border
                                                        : "rgba(122, 162, 247, 0.2)",
                                                    backgroundColor: isSelected
                                                        ? colors.bg
                                                        : "rgba(12, 16, 27, 0.4)",
                                                    color: isSelected
                                                        ? colors.color
                                                        : "text.secondary",
                                                    fontSize: "0.7rem",
                                                    fontWeight: 600,
                                                    letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                    transition: "all 0.2s ease",
                                                    "&:hover": {
                                                        borderColor:
                                                            colors.border,
                                                        backgroundColor:
                                                            colors.bg,
                                                        color: colors.color,
                                                    },
                                                    ...(isSelected && {
                                                        boxShadow: `0 10px 22px ${colors.shadow}`,
                                                    }),
                                                }}
                                            >
                                                {action}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                <Box
                    sx={{
                        my: 3,
                        height: "1px",
                        background:
                            "linear-gradient(90deg, transparent 0%, rgba(122, 162, 247, 0.3) 50%, transparent 100%)",
                    }}
                />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <Box
                        component="button"
                        onClick={() => {
                            const resetActions: {
                                [key: string]: EmulatorAction;
                            } = {};
                            selectedDeviceData.emulatorsEnabled.forEach(
                                (emulator) => {
                                    resetActions[emulator] = "ignore";
                                },
                            );
                            setEmulatorActions(resetActions);
                            setDeviceSyncResponse(null);
                        }}
                        disabled={isResetDisabled}
                        sx={{
                            px: 2.5,
                            py: 1,
                            borderRadius: 999,
                            border: "1px solid",
                            borderColor: isResetDisabled
                                ? "rgba(122, 162, 247, 0.15)"
                                : "rgba(122, 162, 247, 0.35)",
                            backgroundColor: "rgba(122, 162, 247, 0.08)",
                            color: isResetDisabled
                                ? "rgba(169, 178, 199, 0.5)"
                                : "text.secondary",
                            fontSize: "0.75rem",
                            fontFamily: '"Commissioner", sans-serif',
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            cursor: isResetDisabled ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            "&:hover:not(:disabled)": {
                                borderColor: "rgba(79, 209, 197, 0.5)",
                                color: "#eef1f7",
                            },
                        }}
                    >
                        Reset
                    </Box>
                    <Box
                        component="button"
                        onClick={handleSubmit}
                        disabled={isActionDisabled}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 999,
                            border: "1px solid",
                            borderColor: isActionDisabled
                                ? "rgba(122, 162, 247, 0.15)"
                                : "rgba(246, 193, 119, 0.6)",
                            backgroundImage: isActionDisabled
                                ? "none"
                                : "linear-gradient(135deg, #f6c177 0%, #f28fad 100%)",
                            backgroundColor: isActionDisabled
                                ? "rgba(122, 162, 247, 0.08)"
                                : undefined,
                            color: isActionDisabled
                                ? "rgba(169, 178, 199, 0.6)"
                                : "#0b0f17",
                            fontSize: "0.8rem",
                            fontFamily: '"Commissioner", sans-serif',
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            cursor: isActionDisabled
                                ? "not-allowed"
                                : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            boxShadow: isActionDisabled
                                ? "none"
                                : "0 12px 28px rgba(246, 193, 119, 0.35)",
                            "&:hover:not(:disabled)": {
                                transform: "translateY(-1px)",
                                boxShadow:
                                    "0 16px 32px rgba(246, 193, 119, 0.45)",
                            },
                        }}
                    >
                        {requestInProgress ? (
                            <>
                                <TerminalLoader />
                                <span>Syncing</span>
                            </>
                        ) : (
                            "Execute Sync"
                        )}
                    </Box>
                </Box>
            </Box>

            {deviceSyncResponse && (
                <Box
                    sx={{
                        borderTop: "1px solid rgba(122, 162, 247, 0.2)",
                        backgroundColor: "rgba(10, 14, 22, 0.6)",
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 1.6,
                            borderBottom: "1px solid rgba(122, 162, 247, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#7aa2f7",
                                letterSpacing: "0.2em",
                                fontSize: "0.6rem",
                            }}
                        >
                            RESPONSE
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
                                    width: 8,
                                    height: 8,
                                    borderRadius: 999,
                                    backgroundColor: statusColor,
                                    boxShadow: `0 0 12px ${statusColor}66`,
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
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: statusColor,
                                }}
                            >
                                {deviceSyncResponse.deviceSyncRecord.status}
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.65rem",
                                fontFamily: '"Fragment Mono", monospace',
                            }}
                        >
                            ID: {deviceSyncResponse.id}
                        </Typography>
                    </Box>

                    <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ mb: 2.5 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "#7aa2f7",
                                    fontSize: "0.6rem",
                                    letterSpacing: "0.2em",
                                    display: "block",
                                    mb: 1,
                                }}
                            >
                                EXECUTED ACTIONS
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
                                                py: 0.6,
                                                borderRadius: 999,
                                                border: "1px solid",
                                                borderColor:
                                                    item.action === "push"
                                                        ? "rgba(246, 193, 119, 0.6)"
                                                        : "rgba(122, 162, 247, 0.6)",
                                                color:
                                                    item.action === "push"
                                                        ? "#f6c177"
                                                        : "#7aa2f7",
                                                fontSize: "0.65rem",
                                                fontWeight: 600,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                backgroundColor:
                                                    item.action === "push"
                                                        ? "rgba(246, 193, 119, 0.12)"
                                                        : "rgba(122, 162, 247, 0.12)",
                                            }}
                                        >
                                            {capitalize(item.emulator)}:{" "}
                                            {item.action.toUpperCase()}
                                        </Box>
                                    ),
                                )}
                            </Box>
                        </Box>

                        {deviceSyncResponse.deviceSyncRecord.output?.length ? (
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "#7aa2f7",
                                        fontSize: "0.6rem",
                                        letterSpacing: "0.2em",
                                        display: "block",
                                        mb: 1,
                                    }}
                                >
                                    OUTPUT
                                </Typography>
                                <Box
                                    component="pre"
                                    ref={outputRef}
                                    sx={{
                                        m: 0,
                                        p: 2,
                                        borderRadius: "12px",
                                        backgroundColor:
                                            "rgba(9, 12, 19, 0.75)",
                                        border: "1px solid rgba(122, 162, 247, 0.2)",
                                        fontSize: "0.75rem",
                                        fontFamily:
                                            '"Fragment Mono", monospace',
                                        lineHeight: 1.7,
                                        color: "#eef1f7",
                                        overflowX: "auto",
                                        maxHeight: 300,
                                        "&::-webkit-scrollbar": {
                                            width: 6,
                                            height: 6,
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            backgroundColor: "#0b0f17",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor:
                                                "rgba(122, 162, 247, 0.35)",
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
