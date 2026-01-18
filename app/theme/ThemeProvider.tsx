import React, {
    createContext,
    useContext,
    useMemo,
} from "react";
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
                    main: "#00ff41",
                    light: "#66ff7f",
                    dark: "#00cc33",
                    contrastText: "#0a0a0c",
                },
                secondary: {
                    main: "#00ffff",
                    light: "#66ffff",
                    dark: "#00cccc",
                    contrastText: "#0a0a0c",
                },
                success: { main: "#00ff41" },
                error: { main: "#ff3366" },
                warning: { main: "#ffb000" },
                info: { main: "#00ffff" },
                background: {
                    default: "#0a0a0c",
                    paper: "#12121a",
                },
                text: {
                    primary: "#e0e0e0",
                    secondary: "#888899",
                },
                divider: "#1a1a24",
            },
            shape: { borderRadius: 2 },
            typography: {
                fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                h1: {
                    fontFamily: '"Press Start 2P", "VT323", monospace',
                    fontWeight: 400,
                    fontSize: "2rem",
                    letterSpacing: "0.05em",
                },
                h2: {
                    fontFamily: '"Press Start 2P", "VT323", monospace',
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    letterSpacing: "0.05em",
                },
                h3: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    letterSpacing: "0.02em",
                },
                h4: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 600,
                    fontSize: "1.1rem",
                },
                h5: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 600,
                    fontSize: "1rem",
                },
                h6: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                },
                body1: {
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                },
                body2: {
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
                },
                button: {
                    textTransform: "uppercase",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    fontSize: "0.75rem",
                },
                caption: {
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            backgroundColor: "#0a0a0c",
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(18, 18, 26, 0.9)",
                            backgroundImage: "linear-gradient(135deg, rgba(18, 18, 26, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
                            border: "1px solid #1a1a24",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "rgba(0, 255, 65, 0.3)",
                            },
                        },
                    },
                },
                MuiPaper: {
                    defaultProps: { elevation: 0 },
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(18, 18, 26, 0.95)",
                            backgroundImage: "linear-gradient(180deg, rgba(18, 18, 26, 0.95) 0%, rgba(13, 13, 16, 0.98) 100%)",
                            border: "1px solid #1a1a24",
                            borderRadius: 2,
                        },
                    },
                },
                MuiButton: {
                    defaultProps: { size: "medium", disableElevation: true },
                    styleOverrides: {
                        root: {
                            borderRadius: 0,
                            padding: "8px 16px",
                            transition: "all 0.2s ease",
                        },
                        contained: {
                            backgroundColor: "#00ff41",
                            color: "#0a0a0c",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: "#00ff41",
                                boxShadow: "0 0 15px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.3)",
                            },
                        },
                        outlined: {
                            borderColor: "#00ff41",
                            color: "#00ff41",
                            "&:hover": {
                                backgroundColor: "#00ff41",
                                color: "#0a0a0c",
                                borderColor: "#00ff41",
                                boxShadow: "0 0 10px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)",
                            },
                        },
                    },
                },
                MuiChip: {
                    styleOverrides: {
                        root: {
                            borderRadius: 2,
                            fontSize: "0.65rem",
                            fontWeight: 500,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            height: 24,
                        },
                        outlined: {
                            borderColor: "#00ffff",
                            color: "#00ffff",
                            backgroundColor: "rgba(0, 255, 255, 0.05)",
                        },
                    },
                },
                MuiRadio: {
                    styleOverrides: {
                        root: {
                            color: "#00ff41",
                            "&.Mui-checked": {
                                color: "#00ff41",
                            },
                        },
                    },
                },
                MuiFormLabel: {
                    styleOverrides: {
                        root: {
                            color: "#00ffff",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            "&.Mui-focused": {
                                color: "#00ffff",
                            },
                        },
                    },
                },
                MuiFormControlLabel: {
                    styleOverrides: {
                        label: {
                            fontSize: "0.8rem",
                            letterSpacing: "0.02em",
                        },
                    },
                },
                MuiDivider: {
                    styleOverrides: {
                        root: {
                            borderColor: "#1a1a24",
                        },
                    },
                },
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(10, 10, 12, 0.9)",
                            backdropFilter: "blur(10px)",
                            borderBottom: "1px solid #1a1a24",
                        },
                    },
                },
                MuiIconButton: {
                    styleOverrides: {
                        root: {
                            color: "#00ff41",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(0, 255, 65, 0.1)",
                                boxShadow: "0 0 10px rgba(0, 255, 65, 0.3)",
                            },
                        },
                    },
                },
                MuiTooltip: {
                    styleOverrides: {
                        tooltip: {
                            backgroundColor: "#12121a",
                            border: "1px solid #00ff41",
                            color: "#00ff41",
                            fontSize: "0.7rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            letterSpacing: "0.05em",
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
