import { describe, expect, it } from "vitest";
import { capitalize } from "./utils";

describe("capitalize", () => {
    it("uppercases the first character", () => {
        expect(capitalize("emu")).toBe("Emu");
    });

    it("returns an empty string when blank", () => {
        expect(capitalize("")).toBe("");
    });
});
