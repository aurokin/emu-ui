import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
    CssBaseline,
    ThemeProvider,
    createTheme,
    useMediaQuery,
} from "@mui/material";
import { Header } from "~/components/Header";
import { alpha } from "@mui/material/styles";

import type { Route } from "./+types/root";
import { DeviceProvider } from "~/contexts/DeviceContext";
import "~/app.css";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
    type ThemeMode = "system" | "light" | "dark";
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        if (typeof window === "undefined") return "system";
        const stored = window.localStorage.getItem("themeMode");
        return (stored as ThemeMode) || "system";
    });

    type PaletteName = "indigoCyan" | "emeraldSlate" | "amberRose";
    const [paletteName, setPaletteName] = useState<PaletteName>(() => {
        if (typeof window === "undefined") return "emeraldSlate";
        const stored = window.localStorage.getItem("paletteName");
        return (stored as PaletteName) || "emeraldSlate";
    });

    useEffect(() => {
        try {
            window.localStorage.setItem("themeMode", themeMode);
        } catch {}
    }, [themeMode]);

    useEffect(() => {
        try {
            window.localStorage.setItem("paletteName", paletteName);
        } catch {}
    }, [paletteName]);

    const effectiveMode = themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;

    const theme = useMemo(() => {
        const effectiveModeLocal = effectiveMode;

        // Define palette options
        const palettes = {
            indigoCyan: {
                primary: { main: "#6366F1", light: "#A5B4FC", dark: "#4F46E5" },
                secondary: { main: "#06B6D4", light: "#67E8F9", dark: "#0891B2" },
            },
            emeraldSlate: {
                primary: { main: "#10B981", light: "#6EE7B7", dark: "#059669" },
                secondary: { main: "#64748B", light: "#94A3B8", dark: "#475569" },
            },
            amberRose: {
                primary: { main: "#F59E0B", light: "#FCD34D", dark: "#D97706" },
                secondary: { main: "#F43F5E", light: "#FDA4AF", dark: "#E11D48" },
            },
        } as const;

        const chosen = palettes[paletteName];
        const backgroundDefault = effectiveModeLocal === "dark" ? "#0b1020" : "#f8fafc";
        const backgroundPaper = effectiveModeLocal === "dark" ? "#0f172a" : "#ffffff";

        return createTheme({
                cssVariables: true,
                colorSchemes: {
                    light: true,
                    dark: true,
                },
                palette: {
                    mode: effectiveModeLocal,
                    primary: chosen.primary,
                    secondary: chosen.secondary,
                    success: { main: "#22C55E" },
                    error: { main: "#EF4444" },
                    warning: { main: "#F59E0B" },
                    info: { main: "#0EA5E9" },
                    background: {
                        default: backgroundDefault,
                        paper: backgroundPaper,
                    },
                },
                shape: { borderRadius: 12 },
                typography: {
                    fontFamily:
                        'Roboto, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    h1: { fontWeight: 800, letterSpacing: -0.5 },
                    h2: { fontWeight: 700, letterSpacing: -0.25 },
                    h3: { fontWeight: 700 },
                    button: { textTransform: "none", fontWeight: 600 },
                },
                components: {
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                transition: "transform .15s ease, box-shadow .2s ease",
                                backgroundColor: alpha(backgroundPaper, 0.6),
                                backdropFilter: "saturate(160%) blur(8px)",
                                WebkitBackdropFilter: "saturate(160%) blur(8px)",
                                border: `1px solid rgba(148,163,184,0.2)`,
                            },
                        },
                    },
                    MuiPaper: {
                        defaultProps: { elevation: 1 },
                        styleOverrides: {
                            root: {
                                backgroundColor: alpha(backgroundPaper, 0.6),
                                backdropFilter: "saturate(160%) blur(8px)",
                                WebkitBackdropFilter: "saturate(160%) blur(8px)",
                                border: `1px solid rgba(148,163,184,0.2)`,
                            },
                        },
                    },
                    MuiButton: {
                        defaultProps: { size: "medium" },
                    },
                },
        });
    }, [effectiveMode, paletteName]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <DeviceProvider>
                <Header
                    themeMode={themeMode}
                    onCycleMode={() =>
                        setThemeMode((prev) =>
                            prev === "system" ? "light" : prev === "light" ? "dark" : "system",
                        )
                    }
                    paletteName={paletteName}
                    onChangePalette={setPaletteName}
                />
                <Outlet />
            </DeviceProvider>
        </ThemeProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
