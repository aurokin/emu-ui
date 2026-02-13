import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Header } from "~/components/Header";

describe("Header", () => {
    it("renders branding", () => {
        const router = createMemoryRouter([
            {
                path: "/",
                element: <Header />,
            },
        ]);

        render(<RouterProvider router={router} />);

        expect(screen.getByText("EmuSync")).toBeInTheDocument();
        expect(screen.getByText("CONNECTED")).toBeInTheDocument();
    });
});
