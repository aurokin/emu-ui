import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ComputerIcon from "@mui/icons-material/Computer";
import { alpha } from "@mui/material/styles";
import { Logo } from "~/components/Logo";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PaletteIcon from "@mui/icons-material/Palette";
import CircleIcon from "@mui/icons-material/Circle";
import { useState } from "react";

type ThemeMode = "system" | "light" | "dark";

export function Header({
    themeMode,
    onCycleMode,
    paletteName,
    onChangePalette,
}: {
    themeMode: ThemeMode;
    onCycleMode: () => void;
    paletteName: "indigoCyan" | "emeraldSlate" | "amberRose";
    onChangePalette: (name: "indigoCyan" | "emeraldSlate" | "amberRose") => void;
}) {
    const label =
        themeMode === "system"
            ? "Theme: System"
            : themeMode === "light"
              ? "Theme: Light"
              : "Theme: Dark";

    const Icon =
        themeMode === "system"
            ? ComputerIcon
            : themeMode === "light"
              ? LightModeIcon
              : DarkModeIcon;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <AppBar position="sticky" color="transparent" elevation={0}
            sx={(theme) => ({
                backdropFilter: "saturate(180%) blur(10px)",
                WebkitBackdropFilter: "saturate(180%) blur(10px)",
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                borderBottom: `1px solid ${theme.palette.divider}`,
            })}
        >
            <Toolbar disableGutters>
                <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box aria-label="EmuSync" sx={{ display: "flex", alignItems: "center" }}>
                        <Logo size={32} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title={`Palette: ${paletteName}`}>
                        <IconButton color="inherit" aria-label="Choose palette" onClick={handleOpen}>
                            <PaletteIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        <MenuItem
                            selected={paletteName === "emeraldSlate"}
                            onClick={() => {
                                onChangePalette("emeraldSlate");
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                <CircleIcon sx={{ color: "#10B981" }} />
                            </ListItemIcon>
                            <ListItemText primary="Emerald + Slate" />
                        </MenuItem>
                        <MenuItem
                            selected={paletteName === "indigoCyan"}
                            onClick={() => {
                                onChangePalette("indigoCyan");
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                <CircleIcon sx={{ color: "#6366F1" }} />
                            </ListItemIcon>
                            <ListItemText primary="Indigo + Cyan" />
                        </MenuItem>
                        <MenuItem
                            selected={paletteName === "amberRose"}
                            onClick={() => {
                                onChangePalette("amberRose");
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                <CircleIcon sx={{ color: "#F59E0B" }} />
                            </ListItemIcon>
                            <ListItemText primary="Amber + Rose" />
                        </MenuItem>
                    </Menu>
                    <Tooltip title={`${label} — click to change`}>
                        <IconButton color="inherit" onClick={onCycleMode} aria-label="Toggle theme mode">
                            <Icon />
                        </IconButton>
                    </Tooltip>
                </Container>
            </Toolbar>
        </AppBar>
    );
}
