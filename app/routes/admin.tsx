import { useState, useEffect } from "react";
import type { Route } from "./+types/admin";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router";
import type { EmuServer } from "~/server/types";

export function meta(_args: Route.MetaArgs) {
    return [
        { title: "Admin - EmuSync" },
        { name: "description", content: "Configure EmuSync server and devices" },
    ];
}

// Server config field definitions
const serverFields: { key: keyof EmuServer; label: string; description: string }[] = [
    { key: "cemuSave", label: "Cemu Save", description: "Wii U saves (Cemu)" },
    { key: "citraNand", label: "Citra NAND", description: "3DS NAND (Citra)" },
    { key: "citraSdmc", label: "Citra SDMC", description: "3DS SD card (Citra)" },
    { key: "citraSysdata", label: "Citra Sysdata", description: "3DS system data (Citra)" },
    { key: "dolphinGC", label: "Dolphin GC", description: "GameCube saves" },
    { key: "dolphinWii", label: "Dolphin Wii", description: "Wii saves" },
    { key: "mupenFzSave", label: "Mupen64Plus FZ", description: "N64 saves" },
    { key: "nethersx2Save", label: "NetherSX2", description: "PS2 memcards" },
    { key: "ppssppSave", label: "PPSSPP Save", description: "PSP saves" },
    { key: "ppssppState", label: "PPSSPP State", description: "PSP states" },
    { key: "retroarchSave", label: "RetroArch Save", description: "RetroArch saves" },
    { key: "retroarchState", label: "RetroArch State", description: "RetroArch states" },
    { key: "retroarchRgState", label: "RetroArch RG State", description: "RetroArch RG states" },
    { key: "rpcs3Save", label: "RPCS3", description: "PS3 saves" },
    { key: "ryujinxSave", label: "Ryujinx", description: "Switch saves (Ryujinx)" },
    { key: "switchSave", label: "Switch", description: "Switch saves (native)" },
    { key: "vita3kSave", label: "Vita3K", description: "PS Vita saves" },
    { key: "xemuSave", label: "xemu", description: "Xbox saves" },
    { key: "xeniaSave", label: "Xenia", description: "Xbox 360 saves" },
    { key: "yuzuSave", label: "Yuzu", description: "Switch saves (Yuzu)" },
    { key: "workDir", label: "Work Directory", description: "Temporary working directory" },
];

// Device field definitions
const deviceBaseFields = [
    { key: "name", label: "Name", required: true },
    { key: "ip", label: "IP Address", required: true },
    { key: "port", label: "Port", required: true, type: "number" },
    { key: "user", label: "Username", required: true },
    { key: "password", label: "Password", required: true, type: "password" },
    { key: "workDir", label: "Work Directory", required: true },
];

const deviceEmulatorFields = [
    "cemuSave", "citraNand", "citraSdmc", "citraSysdata",
    "dolphinDroidDump", "dolphinGC", "dolphinWii",
    "mupenFzSave", "nethersx2Save", "nethersx2DroidDump", "pcsx2Save",
    "ppssppSave", "ppssppState",
    "retroarchSave", "retroarchState",
    "rpcs3Save", "ryujinxSave", "switchSave",
    "vita3kSave", "xemuSave", "xeniaSave",
    "yuzuDroid", "yuzuDroidDump", "yuzuSave",
];

const osOptions = ["android", "linux", "muos", "nx", "windows"];

type DeviceData = Record<string, unknown>;

export default function Admin() {
    // Server config state
    const [serverConfig, setServerConfig] = useState<Partial<EmuServer>>({});
    const [serverLoading, setServerLoading] = useState(true);
    const [serverSaving, setServerSaving] = useState(false);

    // Device state
    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceData | null>(null);
    const [deviceForm, setDeviceForm] = useState<DeviceData>({});
    const [deviceSaving, setDeviceSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

    // Notification state
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    // Load server config
    useEffect(() => {
        fetch("/api/admin")
            .then((res) => res.json())
            .then((data) => {
                setServerConfig(data);
                setServerLoading(false);
            })
            .catch(() => {
                setSnackbar({
                    open: true,
                    message: "Failed to load server config",
                    severity: "error",
                });
                setServerLoading(false);
            });
    }, []);

    // Load devices
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = () => {
        fetch("/api/admin/devices")
            .then((res) => res.json())
            .then((data) => {
                setDevices(data);
                setDevicesLoading(false);
            })
            .catch(() => {
                setSnackbar({
                    open: true,
                    message: "Failed to load devices",
                    severity: "error",
                });
                setDevicesLoading(false);
            });
    };

    // Server config handlers
    const handleServerFieldChange = (key: keyof EmuServer, value: string) => {
        setServerConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveServerConfig = async () => {
        setServerSaving(true);
        try {
            const res = await fetch("/api/admin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(serverConfig),
            });
            if (res.ok) {
                setSnackbar({
                    open: true,
                    message: "Server config saved successfully",
                    severity: "success",
                });
            } else {
                throw new Error("Failed to save");
            }
        } catch {
            setSnackbar({
                open: true,
                message: "Failed to save server config",
                severity: "error",
            });
        }
        setServerSaving(false);
    };

    // Device handlers
    const handleOpenAddDevice = () => {
        setEditingDevice(null);
        setDeviceForm({ os: "linux", port: 22 });
        setDeviceDialogOpen(true);
    };

    const handleOpenEditDevice = (device: DeviceData) => {
        setEditingDevice(device);
        setDeviceForm({ ...device });
        setDeviceDialogOpen(true);
    };

    const handleDeviceFormChange = (key: string, value: unknown) => {
        setDeviceForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveDevice = async () => {
        setDeviceSaving(true);
        try {
            const isEditing = editingDevice !== null;
            const url = isEditing
                ? `/api/admin/devices/${encodeURIComponent(editingDevice.name as string)}`
                : "/api/admin/devices";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deviceForm),
            });

            if (res.ok) {
                setSnackbar({
                    open: true,
                    message: isEditing
                        ? "Device updated successfully"
                        : "Device added successfully",
                    severity: "success",
                });
                setDeviceDialogOpen(false);
                fetchDevices();
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to save device");
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err instanceof Error ? err.message : "Failed to save device",
                severity: "error",
            });
        }
        setDeviceSaving(false);
    };

    const handleConfirmDelete = async () => {
        if (!deviceToDelete) return;

        try {
            const res = await fetch(
                `/api/admin/devices/${encodeURIComponent(deviceToDelete)}`,
                { method: "DELETE" },
            );

            if (res.ok) {
                setSnackbar({
                    open: true,
                    message: "Device deleted successfully",
                    severity: "success",
                });
                fetchDevices();
            } else {
                throw new Error("Failed to delete");
            }
        } catch {
            setSnackbar({
                open: true,
                message: "Failed to delete device",
                severity: "error",
            });
        }
        setDeleteDialogOpen(false);
        setDeviceToDelete(null);
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(17, 24, 37, 0.6)",
            borderRadius: 2,
            "& fieldset": {
                borderColor: "rgba(122, 162, 247, 0.2)",
            },
            "&:hover fieldset": {
                borderColor: "rgba(79, 209, 197, 0.4)",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4fd1c5",
            },
        },
        "& .MuiInputLabel-root": {
            color: "text.secondary",
        },
        "& .MuiInputBase-input": {
            fontSize: "0.9rem",
        },
    };

    const accordionSx = {
        backgroundColor: "rgba(17, 24, 37, 0.82)",
        borderRadius: "12px !important",
        border: "1px solid rgba(122, 162, 247, 0.2)",
        "&:before": { display: "none" },
        mb: 2,
        "&.Mui-expanded": {
            borderColor: "rgba(79, 209, 197, 0.4)",
        },
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                    component={Link}
                    to="/"
                    sx={{
                        color: "text.secondary",
                        "&:hover": { color: "#4fd1c5" },
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#7aa2f7",
                            letterSpacing: "0.2em",
                            display: "block",
                            mb: 1,
                        }}
                    >
                        ADMINISTRATION
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Unbounded", sans-serif',
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        Configuration
                    </Typography>
                    <Typography
                        sx={{
                            color: "text.secondary",
                            maxWidth: 520,
                            fontSize: "0.95rem",
                        }}
                    >
                        Manage server paths and device connections
                    </Typography>
                </Box>
            </Box>

            {/* Device Management */}
            <Accordion defaultExpanded sx={accordionSx}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#7aa2f7" }} />}>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: '"Unbounded", sans-serif',
                                fontWeight: 600,
                                fontSize: "1.1rem",
                            }}
                        >
                            Devices
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Manage device connections and emulator paths
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {devicesLoading ? (
                        <Typography sx={{ color: "text.secondary" }}>Loading...</Typography>
                    ) : (
                        <>
                            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenAddDevice}
                                    sx={{
                                        borderColor: "#4fd1c5",
                                        color: "#4fd1c5",
                                        "&:hover": {
                                            borderColor: "#3dbdb2",
                                            backgroundColor: "rgba(79, 209, 197, 0.1)",
                                        },
                                    }}
                                >
                                    Add Device
                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    overflowX: "auto",
                                    borderRadius: 2,
                                    border: "1px solid rgba(122, 162, 247, 0.2)",
                                }}
                            >
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: "#7aa2f7", fontWeight: 600 }}>
                                                Name
                                            </TableCell>
                                            <TableCell sx={{ color: "#7aa2f7", fontWeight: 600 }}>
                                                IP
                                            </TableCell>
                                            <TableCell sx={{ color: "#7aa2f7", fontWeight: 600 }}>
                                                Port
                                            </TableCell>
                                            <TableCell sx={{ color: "#7aa2f7", fontWeight: 600 }}>
                                                OS
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ color: "#7aa2f7", fontWeight: 600 }}
                                            >
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {devices.map((device) => (
                                            <TableRow
                                                key={device.name as string}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor: "rgba(79, 209, 197, 0.05)",
                                                    },
                                                }}
                                            >
                                                <TableCell>{device.name as string}</TableCell>
                                                <TableCell sx={{ fontFamily: "monospace" }}>
                                                    {device.ip as string}
                                                </TableCell>
                                                <TableCell>{device.port as number}</TableCell>
                                                <TableCell>{device.os as string}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditDevice(device)}
                                                        sx={{ color: "#7aa2f7" }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setDeviceToDelete(device.name as string);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        sx={{ color: "#f28fad" }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {devices.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    sx={{ textAlign: "center", color: "text.secondary" }}
                                                >
                                                    No devices configured
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Server Configuration */}
            <Accordion sx={accordionSx}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#7aa2f7" }} />}>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: '"Unbounded", sans-serif',
                                fontWeight: 600,
                                fontSize: "1.1rem",
                            }}
                        >
                            Server Paths
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Configure emulator save locations on the server
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {serverLoading ? (
                        <Typography sx={{ color: "text.secondary" }}>Loading...</Typography>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 2,
                                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                }}
                            >
                                {serverFields.map((field) => (
                                    <TextField
                                        key={field.key}
                                        label={field.label}
                                        value={(serverConfig[field.key] as string) || ""}
                                        onChange={(e) =>
                                            handleServerFieldChange(field.key, e.target.value)
                                        }
                                        helperText={field.description}
                                        fullWidth
                                        size="small"
                                        sx={inputSx}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveServerConfig}
                                    disabled={serverSaving}
                                    sx={{
                                        backgroundColor: "#4fd1c5",
                                        color: "#0a0d14",
                                        fontWeight: 600,
                                        "&:hover": {
                                            backgroundColor: "#3dbdb2",
                                        },
                                    }}
                                >
                                    {serverSaving ? "Saving..." : "Save Server Config"}
                                </Button>
                            </Box>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Device Add/Edit Dialog */}
            <Dialog
                open={deviceDialogOpen}
                onClose={() => setDeviceDialogOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: "rgba(17, 24, 37, 0.98)",
                            border: "1px solid rgba(122, 162, 247, 0.3)",
                            borderRadius: 3,
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontFamily: '"Unbounded", sans-serif',
                        fontWeight: 600,
                    }}
                >
                    {editingDevice ? "Edit Device" : "Add Device"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "#7aa2f7", mb: 2, fontWeight: 600 }}
                        >
                            Connection Details
                        </Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                mb: 3,
                            }}
                        >
                            {deviceBaseFields.map((field) => (
                                <TextField
                                    key={field.key}
                                    label={field.label}
                                    value={(deviceForm[field.key] as string | number) ?? ""}
                                    onChange={(e) =>
                                        handleDeviceFormChange(
                                            field.key,
                                            field.type === "number"
                                                ? Number(e.target.value)
                                                : e.target.value,
                                        )
                                    }
                                    required={field.required}
                                    type={field.type || "text"}
                                    fullWidth
                                    size="small"
                                    sx={inputSx}
                                />
                            ))}
                            <FormControl fullWidth size="small" sx={inputSx}>
                                <InputLabel>Operating System</InputLabel>
                                <Select
                                    value={(deviceForm.os as string) || "linux"}
                                    label="Operating System"
                                    onChange={(e) => handleDeviceFormChange("os", e.target.value)}
                                >
                                    {osOptions.map((os) => (
                                        <MenuItem key={os} value={os}>
                                            {os}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Typography
                            variant="subtitle2"
                            sx={{ color: "#7aa2f7", mb: 2, fontWeight: 600 }}
                        >
                            Emulator Paths (Optional)
                        </Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            }}
                        >
                            {deviceEmulatorFields.map((field) => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={(deviceForm[field] as string) || ""}
                                    onChange={(e) => handleDeviceFormChange(field, e.target.value)}
                                    fullWidth
                                    size="small"
                                    sx={inputSx}
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setDeviceDialogOpen(false)}
                        sx={{ color: "text.secondary" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveDevice}
                        disabled={deviceSaving}
                        sx={{
                            backgroundColor: "#4fd1c5",
                            color: "#0a0d14",
                            fontWeight: 600,
                            "&:hover": { backgroundColor: "#3dbdb2" },
                        }}
                    >
                        {deviceSaving ? "Saving..." : editingDevice ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: "rgba(17, 24, 37, 0.98)",
                            border: "1px solid rgba(242, 143, 173, 0.3)",
                            borderRadius: 3,
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontFamily: '"Unbounded", sans-serif' }}>
                    Delete Device
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{deviceToDelete}"? This action cannot be
                        undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ color: "text.secondary" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmDelete}
                        sx={{
                            backgroundColor: "#f28fad",
                            color: "#0a0d14",
                            fontWeight: 600,
                            "&:hover": { backgroundColor: "#e07a9a" },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    sx={{
                        backgroundColor:
                            snackbar.severity === "success"
                                ? "rgba(79, 209, 197, 0.15)"
                                : "rgba(242, 143, 173, 0.15)",
                        border: "1px solid",
                        borderColor:
                            snackbar.severity === "success"
                                ? "rgba(79, 209, 197, 0.4)"
                                : "rgba(242, 143, 173, 0.4)",
                        color: snackbar.severity === "success" ? "#4fd1c5" : "#f28fad",
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
