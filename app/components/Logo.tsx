export function Logo({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            role="img"
            aria-label="EmuSync logo"
            style={{
                filter: "drop-shadow(0 0 4px #00ff41)",
            }}
        >
            {/* Pixel grid background */}
            <rect
                x="2"
                y="2"
                width="28"
                height="28"
                fill="none"
                stroke="#1a1a24"
                strokeWidth="1"
            />

            {/* Inner frame */}
            <rect
                x="4"
                y="4"
                width="24"
                height="24"
                fill="rgba(0, 255, 65, 0.05)"
                stroke="#00ff41"
                strokeWidth="1"
                opacity="0.8"
            />

            {/* Sync arrows - pixel art style */}
            {/* Top arrow pointing right */}
            <g fill="#00ff41">
                {/* Arrow shaft */}
                <rect x="8" y="10" width="10" height="2" />
                {/* Arrow head */}
                <rect x="16" y="8" width="2" height="2" />
                <rect x="18" y="10" width="2" height="2" />
                <rect x="16" y="12" width="2" height="2" />
            </g>

            {/* Bottom arrow pointing left */}
            <g fill="#00ffff">
                {/* Arrow shaft */}
                <rect x="14" y="20" width="10" height="2" />
                {/* Arrow head */}
                <rect x="14" y="18" width="2" height="2" />
                <rect x="12" y="20" width="2" height="2" />
                <rect x="14" y="22" width="2" height="2" />
            </g>

            {/* Center connection dots */}
            <rect x="15" y="15" width="2" height="2" fill="#00ff41" opacity="0.6" />

            {/* Corner accents - pixel style */}
            <rect x="4" y="4" width="3" height="1" fill="#00ff41" opacity="0.5" />
            <rect x="4" y="4" width="1" height="3" fill="#00ff41" opacity="0.5" />
            <rect x="25" y="4" width="3" height="1" fill="#00ffff" opacity="0.5" />
            <rect x="27" y="4" width="1" height="3" fill="#00ffff" opacity="0.5" />
            <rect x="4" y="27" width="3" height="1" fill="#00ffff" opacity="0.5" />
            <rect x="4" y="25" width="1" height="3" fill="#00ffff" opacity="0.5" />
            <rect x="25" y="27" width="3" height="1" fill="#00ff41" opacity="0.5" />
            <rect x="27" y="25" width="1" height="3" fill="#00ff41" opacity="0.5" />
        </svg>
    );
}
