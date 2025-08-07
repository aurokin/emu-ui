import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "react-router";
import { Header } from "~/components/Header";
import { DeviceProvider } from "~/contexts/DeviceContext";
import "~/app.css";
import {
    ThemeSettingsProvider,
    type ThemeMode,
    type PaletteName,
} from "~/theme/ThemeProvider";
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

export async function loader({ request }: Route.LoaderArgs) {
    const cookie = request.headers.get("cookie") || "";
    const get = (name: string) =>
        cookie
            .split(/;\s*/)
            .map((p) => p.split("="))
            .find(([k]) => k === name)?.[1];
    const themeFromCookie = get("themeMode");
    const paletteFromCookie = get("paletteName");
    const initialThemeMode: ThemeMode | undefined =
        themeFromCookie === "light" || themeFromCookie === "dark"
            ? (themeFromCookie as ThemeMode)
            : undefined;
    const initialPaletteName: PaletteName | undefined =
        paletteFromCookie === "indigoCyan" ||
        paletteFromCookie === "emeraldSlate" ||
        paletteFromCookie === "amberRose"
            ? (paletteFromCookie as PaletteName)
            : undefined;
    return { initialThemeMode, initialPaletteName };
}

export default function App() {
    const { initialThemeMode, initialPaletteName } =
        useLoaderData<typeof loader>();
    return (
        <ThemeSettingsProvider
            initialThemeMode={initialThemeMode}
            initialPaletteName={initialPaletteName}
        >
            <DeviceProvider>
                <Header />
                <Outlet />
            </DeviceProvider>
        </ThemeSettingsProvider>
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
