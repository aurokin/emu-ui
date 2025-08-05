import type { Route } from "./+types/home";
import Typography from "@mui/material/Typography";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div>
            <Typography variant="h1">Home</Typography>
        </div>
    );
}
