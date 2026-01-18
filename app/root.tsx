import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { Header } from "~/components/Header";
import { DeviceProvider } from "~/contexts/DeviceContext";
import "~/app.css";
import { ThemeSettingsProvider } from "~/theme/ThemeProvider";
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Press+Start+2P&display=swap",
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
    return (
        <ThemeSettingsProvider>
            <DeviceProvider>
                <Header />
                <Outlet />
            </DeviceProvider>
        </ThemeSettingsProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "ERROR";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "ERROR";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main
            style={{
                padding: "64px 16px 16px",
                maxWidth: "1024px",
                margin: "0 auto",
                fontFamily: '"JetBrains Mono", monospace',
                color: "#e0e0e0",
            }}
        >
            <div
                style={{
                    border: "1px solid #ff3366",
                    backgroundColor: "rgba(255, 51, 102, 0.05)",
                    padding: "24px",
                }}
            >
                <h1
                    style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: "1.25rem",
                        color: "#ff3366",
                        textShadow: "0 0 10px rgba(255, 51, 102, 0.5)",
                        marginBottom: "16px",
                        letterSpacing: "0.05em",
                    }}
                >
                    {message}
                </h1>
                <p
                    style={{
                        color: "#888899",
                        fontSize: "0.875rem",
                        marginBottom: stack ? "16px" : 0,
                    }}
                >
                    {details}
                </p>
                {stack && (
                    <pre
                        style={{
                            padding: "16px",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            border: "1px solid #1a1a24",
                            fontSize: "0.75rem",
                            color: "#00cc33",
                            overflow: "auto",
                            margin: 0,
                        }}
                    >
                        <code>{stack}</code>
                    </pre>
                )}
            </div>
        </main>
    );
}
