import { useTheme } from "@mui/material/styles";

export function Logo({ size = 28 }: { size?: number }) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            role="img"
            aria-label="EmuSync logo"
        >
            <defs>
                <linearGradient id="emuGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={primary} />
                    <stop offset="100%" stopColor={secondary} />
                </linearGradient>
            </defs>
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="6"
                fill="url(#emuGradient)"
                opacity={0.50}
            />
            <g stroke="url(#emuGradient)" strokeWidth="2.8" strokeLinecap="round" fill="none">
                <path d="M8 7.5 L8 16.5" />
                <path d="M9 7.5 H18" />
                <path d="M9 12 H16.5" />
                <path d="M9 16.5 H18" />
            </g>
        </svg>
    );
}
