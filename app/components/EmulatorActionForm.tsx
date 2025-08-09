import { useEffect } from "react";
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
import { useDevices } from "~/contexts/DeviceContext";
import type { EmulatorAction } from "~/types/emulatorAction";
import type { DeviceSyncRequest } from "~/types/device";
import { capitalize } from "~/utilities/utils";

export function EmulatorActionForm() {
    const { devices, selectedDevice, emulatorActions, setEmulatorActions } =
        useDevices();

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
            const res = await fetch("/api/device-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            // eslint-disable-next-line no-console
            console.log("Device sync requested", payload);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to request device sync", err);
        }
    };

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
                        !selectedDeviceData.emulatorsEnabled.some(
                            (emu) =>
                                emulatorActions[emu] === "push" ||
                                emulatorActions[emu] === "pull",
                        )
                    }
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Box>
        </Paper>
    );
}
