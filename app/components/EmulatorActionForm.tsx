import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useDevices } from "~/contexts/DeviceContext";
import type { EmulatorAction } from "~/types/emulatorAction";
import type { DeviceSyncRequest, DeviceSyncResponse } from "~/types/device";
import { SyncStatus } from "~/types/device";
import { capitalize } from "~/utilities/utils";

export function EmulatorActionForm() {
    const {
        devices,
        selectedDevice,
        emulatorActions,
        setEmulatorActions,
        deviceSyncResponse,
        setDeviceSyncResponse,
    } =
        useDevices();

    const selectedDeviceData = devices.find(
        (device) => device.name === selectedDevice,
    );

    const [requestInProgress, setRequestInProgress] = useState(false);

    useEffect(() => {
        if (selectedDeviceData) {
            const defaultActions: { [key: string]: EmulatorAction } = {};
            selectedDeviceData.emulatorsEnabled.forEach((emulator) => {
                defaultActions[emulator] = "ignore";
            });
            setEmulatorActions(defaultActions);
        }
        // Clear any previous sync response when switching devices
        setDeviceSyncResponse(null);
        // Ensure we are not stuck in a loading state on device change
        setRequestInProgress(false);
    }, [selectedDevice, selectedDeviceData, setEmulatorActions]);

    if (!selectedDevice || !selectedDeviceData) {
        return null;
    }

    const handleActionChange = (emulator: string, action: EmulatorAction) => {
        setEmulatorActions({
            ...emulatorActions,
            [emulator]: action,
        });
    };

    const handleSubmit = async () => {
        const payload: DeviceSyncRequest = {
            deviceName: selectedDeviceData.name,
            emulatorActions: Object.entries(emulatorActions)
                .filter(([, action]) => action !== "ignore")
                .map(([emulator, action]) => ({ emulator, action })),
        };

        try {
            // Reset previous response and start request
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
            // eslint-disable-next-line no-console
            console.log("Device sync requested", data);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to request device sync", err);
            setRequestInProgress(false);
        }
    };

    // Poll for sync status updates every 3s while in progress
    useEffect(() => {
        if (
            deviceSyncResponse &&
            deviceSyncResponse.deviceSyncRecord.status === SyncStatus.IN_PROGRESS
        ) {
            const id = deviceSyncResponse.id;
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/device-sync/${id}`);
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
                    // Stop polling on error to avoid loops; surface via console
                    // eslint-disable-next-line no-console
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

    // Stop showing in-progress once status leaves IN_PROGRESS
    useEffect(() => {
        if (!deviceSyncResponse) return;
        if (
            deviceSyncResponse.deviceSyncRecord.status !==
            SyncStatus.IN_PROGRESS
        ) {
            setRequestInProgress(false);
        }
    }, [deviceSyncResponse?.deviceSyncRecord.status]);

    return (
        <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom>
                Emulator Actions for {selectedDeviceData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose what action to perform for each emulator:
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {selectedDeviceData.emulatorsEnabled.map((emulator) => (
                    <FormControl key={emulator}>
                        <FormLabel component="legend">
                            {capitalize(emulator)}
                        </FormLabel>
                        <RadioGroup
                            row
                            value={emulatorActions[emulator] || "ignore"}
                            onChange={(e) =>
                                handleActionChange(
                                    emulator,
                                    e.target.value as EmulatorAction,
                                )
                            }
                        >
                            <FormControlLabel
                                value="ignore"
                                control={<Radio />}
                                label="Ignore"
                            />
                            <FormControlLabel
                                value="push"
                                control={<Radio />}
                                label="Push"
                            />
                            <FormControlLabel
                                value="pull"
                                control={<Radio />}
                                label="Pull"
                            />
                        </RadioGroup>
                    </FormControl>
                ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={
                        requestInProgress ||
                        !selectedDeviceData.emulatorsEnabled.some(
                            (emu) =>
                                emulatorActions[emu] === "push" ||
                                emulatorActions[emu] === "pull",
                        )
                    }
                    onClick={handleSubmit}
                >
                    {requestInProgress ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        "Submit"
                    )}
                </Button>
            </Box>

            {deviceSyncResponse && (
                <Paper sx={{ p: 2, mt: 3 }} variant="outlined">
                    <Typography variant="subtitle1" gutterBottom>
                        Sync Response
                    </Typography>
                    <Typography variant="body2">
                        ID: {deviceSyncResponse.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Status: {deviceSyncResponse.deviceSyncRecord.status}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Actions
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, my: 1 }}>
                        {deviceSyncResponse.deviceSyncRecord.deviceSyncRequest.emulatorActions.map(
                            (item) => (
                                <Box component="li" key={item.emulator}>
                                    <Typography variant="body2">
                                        {capitalize(item.emulator)} — {item.action}
                                    </Typography>
                                </Box>
                            ),
                        )}
                    </Box>
                    {deviceSyncResponse.deviceSyncRecord.output?.length ? (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 1 }}
                            >
                                Output
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    p: 1,
                                    bgcolor: "action.hover",
                                    borderRadius: 1,
                                    overflowX: "auto",
                                }}
                            >
                                {deviceSyncResponse.deviceSyncRecord.output.join(
                                    "\n",
                                )}
                            </Box>
                        </>
                    ) : null}
                </Paper>
            )}
        </Paper>
    );
}
