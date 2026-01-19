import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "~/components/Header";

describe("Header", () => {
    it("renders branding", () => {
        render(<Header />);

        expect(screen.getByText("EmuSync")).toBeInTheDocument();
        expect(screen.getByText("CONNECTED")).toBeInTheDocument();
    });
});
