export function Logo({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            role="img"
            aria-label="EmuSync logo"
            style={{
                filter: "drop-shadow(0 8px 16px rgba(79, 209, 197, 0.25))",
            }}
        >
            <defs>
                <linearGradient id="emuGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7aa2f7" />
                    <stop offset="100%" stopColor="#4fd1c5" />
                </linearGradient>
                <linearGradient id="emuAccent" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6c177" />
                    <stop offset="100%" stopColor="#f28fad" />
                </linearGradient>
            </defs>

            <circle
                cx="16"
                cy="16"
                r="13.5"
                fill="rgba(17, 24, 37, 0.75)"
                stroke="url(#emuGradient)"
                strokeWidth="1.5"
            />
            <circle
                cx="16"
                cy="16"
                r="9"
                fill="none"
                stroke="rgba(122, 162, 247, 0.35)"
                strokeWidth="1"
            />

            <path
                d="M10 15a6 6 0 0 1 9.5-4.5"
                stroke="url(#emuGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M20.5 7.8l2.7 2.3-3.6 1"
                stroke="url(#emuGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M22 17a6 6 0 0 1-9.5 4.5"
                stroke="url(#emuAccent)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M11.5 24.2l-2.7-2.3 3.6-1"
                stroke="url(#emuAccent)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
