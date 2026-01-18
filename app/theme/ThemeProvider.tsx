import React, { createContext, useContext, useMemo } from "react";
import { CssBaseline } from "@mui/material";
import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
} from "@mui/material/styles";

type ThemeSettings = {
    themeMode: "dark";
};

const ThemeSettingsContext = createContext<ThemeSettings | undefined>(
    undefined,
);

export function useThemeSettings(): ThemeSettings {
    const ctx = useContext(ThemeSettingsContext);
    if (!ctx)
        throw new Error(
            "useThemeSettings must be used within ThemeSettingsProvider",
        );
    return ctx;
}

export function ThemeSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useMemo(() => {
        return createTheme({
            cssVariables: true,
            palette: {
                mode: "dark",
                primary: {
                    main: "#4fd1c5",
                    light: "#7be5dc",
                    dark: "#38b2ac",
                    contrastText: "#0b0f17",
                },
                secondary: {
                    main: "#7aa2f7",
                    light: "#9dbbff",
                    dark: "#5b7fe6",
                    contrastText: "#0b0f17",
                },
                success: { main: "#4fd1c5" },
                error: { main: "#f28fad" },
                warning: { main: "#f6c177" },
                info: { main: "#7aa2f7" },
                background: {
                    default: "#0b0f17",
                    paper: "#121a28",
                },
                text: {
                    primary: "#eef1f7",
                    secondary: "#a9b2c7",
                },
                divider: "rgba(122, 162, 247, 0.2)",
            },
            shape: { borderRadius: 14 },
            typography: {
                fontFamily: '"Hanken Grotesk", "Segoe UI", sans-serif',
                h1: {
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 600,
                    fontSize: "2.6rem",
                    letterSpacing: "-0.02em",
                },
                h2: {
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 600,
                    fontSize: "2.1rem",
                    letterSpacing: "-0.015em",
                },
                h3: {
                    fontWeight: 600,
                    fontSize: "1.6rem",
                    letterSpacing: "-0.01em",
                },
                h4: {
                    fontWeight: 600,
                    fontSize: "1.3rem",
                },
                h5: {
                    fontWeight: 600,
                    fontSize: "1.1rem",
                },
                h6: {
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                },
                body1: {
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                },
                body2: {
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                },
                button: {
                    textTransform: "none",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    fontSize: "0.85rem",
                },
                caption: {
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            backgroundColor: "#0b0f17",
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(17, 24, 37, 0.86)",
                            border: "1px solid rgba(122, 162, 247, 0.2)",
                            borderRadius: 18,
                            boxShadow: "0 16px 40px rgba(6, 9, 16, 0.35)",
                            backdropFilter: "blur(18px)",
                        },
                    },
                },
                MuiPaper: {
                    defaultProps: { elevation: 0 },
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(17, 24, 37, 0.9)",
                            border: "1px solid rgba(122, 162, 247, 0.2)",
                            borderRadius: 16,
                            backdropFilter: "blur(18px)",
                        },
                    },
                },
                MuiButton: {
                    defaultProps: { size: "medium", disableElevation: true },
                    styleOverrides: {
                        root: {
                            borderRadius: 999,
                            padding: "10px 20px",
                            textTransform: "none",
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                        },
                        contained: {
                            backgroundImage:
                                "linear-gradient(135deg, #f6c177 0%, #f28fad 100%)",
                            color: "#0b0f17",
                            boxShadow: "0 10px 30px rgba(246, 193, 119, 0.25)",
                            "&:hover": {
                                backgroundImage:
                                    "linear-gradient(135deg, #f6c177 0%, #f28fad 100%)",
                                boxShadow:
                                    "0 12px 36px rgba(246, 193, 119, 0.35)",
                            },
                        },
                        outlined: {
                            borderColor: "rgba(122, 162, 247, 0.4)",
                            color: "#eef1f7",
                            backgroundColor: "rgba(122, 162, 247, 0.08)",
                            "&:hover": {
                                borderColor: "rgba(79, 209, 197, 0.6)",
                                backgroundColor: "rgba(79, 209, 197, 0.12)",
                            },
                        },
                    },
                },
                MuiChip: {
                    styleOverrides: {
                        root: {
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            height: 26,
                        },
                        outlined: {
                            borderColor: "rgba(122, 162, 247, 0.4)",
                            color: "#eef1f7",
                            backgroundColor: "rgba(122, 162, 247, 0.1)",
                        },
                    },
                },
                MuiRadio: {
                    styleOverrides: {
                        root: {
                            color: "rgba(122, 162, 247, 0.5)",
                            "&.Mui-checked": {
                                color: "#4fd1c5",
                            },
                        },
                    },
                },
                MuiFormLabel: {
                    styleOverrides: {
                        root: {
                            color: "#a9b2c7",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            "&.Mui-focused": {
                                color: "#7aa2f7",
                            },
                        },
                    },
                },
                MuiFormControlLabel: {
                    styleOverrides: {
                        label: {
                            fontSize: "0.85rem",
                            letterSpacing: "0.01em",
                        },
                    },
                },
                MuiDivider: {
                    styleOverrides: {
                        root: {
                            borderColor: "rgba(122, 162, 247, 0.2)",
                        },
                    },
                },
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(12, 16, 27, 0.68)",
                            backdropFilter: "blur(16px)",
                            borderBottom: "1px solid rgba(122, 162, 247, 0.2)",
                        },
                    },
                },
                MuiIconButton: {
                    styleOverrides: {
                        root: {
                            color: "#7aa2f7",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(79, 209, 197, 0.12)",
                            },
                        },
                    },
                },
                MuiTooltip: {
                    styleOverrides: {
                        tooltip: {
                            backgroundColor: "#141c2b",
                            border: "1px solid rgba(122, 162, 247, 0.3)",
                            color: "#eef1f7",
                            fontSize: "0.75rem",
                            fontFamily: '"Hanken Grotesk", sans-serif',
                            letterSpacing: "0.02em",
                        },
                    },
                },
            },
        });
    }, []);

    return (
        <ThemeSettingsContext.Provider
            value={{
                themeMode: "dark",
            }}
        >
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeSettingsContext.Provider>
    );
}
