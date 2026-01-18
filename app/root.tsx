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
        href: "https://fonts.googleapis.com/css2?family=Commissioner:wght@300;400;500;600;700&family=Unbounded:wght@400;500;600;700&family=Fragment+Mono&display=swap",
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
                padding: "72px 20px 24px",
                maxWidth: "960px",
                margin: "0 auto",
                fontFamily: '"Commissioner", sans-serif',
                color: "#eef1f7",
            }}
        >
            <div
                style={{
                    border: "1px solid rgba(242, 143, 173, 0.6)",
                    backgroundColor: "rgba(242, 143, 173, 0.08)",
                    padding: "28px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 50px rgba(8, 10, 18, 0.35)",
                }}
            >
                <h1
                    style={{
                        fontFamily: '"Unbounded", sans-serif',
                        fontSize: "1.85rem",
                        color: "#f28fad",
                        marginBottom: "12px",
                        letterSpacing: "0.02em",
                    }}
                >
                    {message}
                </h1>
                <p
                    style={{
                        color: "#cbd3e2",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        marginBottom: stack ? "16px" : 0,
                    }}
                >
                    {details}
                </p>
                {stack && (
                    <pre
                        style={{
                            padding: "16px 18px",
                            backgroundColor: "rgba(10, 14, 22, 0.8)",
                            border: "1px solid rgba(122, 162, 247, 0.25)",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontFamily: '"Fragment Mono", monospace',
                            color: "#7aa2f7",
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
