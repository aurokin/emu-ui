export function Logo({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            role="img"
            aria-label="EmuSync logo"
            style={{
                filter: "drop-shadow(0 10px 18px rgba(122, 162, 247, 0.3))",
            }}
        >
            <defs>
                <linearGradient id="emuShell" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7aa2f7" />
                    <stop offset="100%" stopColor="#4fd1c5" />
                </linearGradient>
                <linearGradient id="emuCore" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6c177" />
                    <stop offset="100%" stopColor="#f28fad" />
                </linearGradient>
                <radialGradient id="emuGlow" cx="0.2" cy="0.1" r="1">
                    <stop offset="0%" stopColor="#7aa2f7" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#121826" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#0b0f17" />
                </radialGradient>
            </defs>

            <path
                d="M16 3.5L25.5 9v14L16 28.5 6.5 23V9L16 3.5z"
                fill="url(#emuGlow)"
                stroke="url(#emuShell)"
                strokeWidth="1.5"
            />
            <path
                d="M16 8.4L22.4 16 16 23.6 9.6 16z"
                fill="rgba(12, 17, 27, 0.75)"
                stroke="rgba(122, 162, 247, 0.35)"
                strokeWidth="1"
            />
            <path
                d="M10.8 17.6c1.8 2.6 6 3.3 9.1 1.4"
                stroke="url(#emuCore)"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M21.2 14.4c-1.8-2.6-6-3.3-9.1-1.4"
                stroke="url(#emuShell)"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
            />
            <circle cx="10.8" cy="17.6" r="1.3" fill="#4fd1c5" />
            <circle cx="21.2" cy="14.4" r="1.3" fill="#f6c177" />
            <circle cx="16" cy="16" r="1.4" fill="rgba(122, 162, 247, 0.8)" />
        </svg>
    );
}
