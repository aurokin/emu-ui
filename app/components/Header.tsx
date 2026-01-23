import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link } from "react-router";
import { Logo } from "~/components/Logo";

export function Header() {
    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: "rgba(12, 16, 27, 0.7)",
                borderBottom: "1px solid",
                borderColor: "rgba(122, 162, 247, 0.2)",
                boxShadow: "0 12px 36px rgba(6, 9, 16, 0.4)",
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(79, 209, 197, 0.6) 30%, rgba(122, 162, 247, 0.6) 60%, transparent 100%)",
                    opacity: 0.7,
                },
            }}
        >
            <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 } }}>
                <Container
                    maxWidth="lg"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Logo size={30} />
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: '"Unbounded", sans-serif',
                                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                    fontWeight: 600,
                                    letterSpacing: "0.02em",
                                }}
                            >
                                EmuSync
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.7rem",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                Cloud saves, seamlessly
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.75,
                            py: 0.75,
                            borderRadius: 999,
                            border: "1px solid",
                            borderColor: "rgba(79, 209, 197, 0.4)",
                            backgroundColor: "rgba(79, 209, 197, 0.12)",
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: "#4fd1c5",
                                boxShadow: "0 0 12px rgba(79, 209, 197, 0.7)",
                                animation: "pulse 2.2s ease-in-out infinite",
                                "@keyframes pulse": {
                                    "0%, 100%": {
                                        transform: "scale(1)",
                                        opacity: 1,
                                    },
                                    "50%": {
                                        transform: "scale(1.4)",
                                        opacity: 0.6,
                                    },
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#4fd1c5",
                                fontSize: "0.65rem",
                                letterSpacing: "0.12em",
                            }}
                        >
                            CONNECTED
                        </Typography>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.65rem",
                            letterSpacing: "0.1em",
                            opacity: 0.7,
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        v1.0.0
                    </Typography>

                    <IconButton
                        component={Link}
                        to="/admin"
                        size="small"
                        sx={{
                            color: "text.secondary",
                            ml: 1,
                            "&:hover": {
                                color: "#4fd1c5",
                                backgroundColor: "rgba(79, 209, 197, 0.1)",
                            },
                        }}
                    >
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Container>
            </Toolbar>
        </AppBar>
    );
}
