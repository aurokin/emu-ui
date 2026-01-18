import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Logo } from "~/components/Logo";

export function Header() {
    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                backgroundColor: "rgba(10, 10, 12, 0.85)",
                borderBottom: "1px solid",
                borderColor: "divider",
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, transparent 0%, #00ff41 20%, #00ffff 50%, #00ff41 80%, transparent 100%)",
                    opacity: 0.4,
                },
            }}
        >
            <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
                <Container
                    maxWidth="lg"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    {/* Logo and Title */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Logo size={28} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                color: "#00ff41",
                                textShadow: "0 0 10px rgba(0, 255, 65, 0.5)",
                                letterSpacing: "0.1em",
                            }}
                        >
                            EMUSYNC
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Status Indicator */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 0,
                            backgroundColor: "rgba(0, 255, 65, 0.03)",
                        }}
                    >
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: 0,
                                backgroundColor: "#00ff41",
                                boxShadow: "0 0 8px #00ff41",
                                animation: "pulse-glow 2s ease-in-out infinite",
                                "@keyframes pulse-glow": {
                                    "0%, 100%": {
                                        opacity: 1,
                                        boxShadow: "0 0 5px #00ff41",
                                    },
                                    "50%": {
                                        opacity: 0.7,
                                        boxShadow: "0 0 15px #00ff41",
                                    },
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#00ff41",
                                fontSize: "0.6rem",
                                letterSpacing: "0.15em",
                                fontWeight: 500,
                            }}
                        >
                            ONLINE
                        </Typography>
                    </Box>

                    {/* Version Tag */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            opacity: 0.6,
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        v1.0.0
                    </Typography>
                </Container>
            </Toolbar>
        </AppBar>
    );
}
