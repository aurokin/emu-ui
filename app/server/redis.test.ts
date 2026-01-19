import { describe, expect, it, vi } from "vitest";

const redisMocks = vi.hoisted(() => ({
    createClient: vi.fn(),
}));

vi.mock("redis", () => ({
    createClient: redisMocks.createClient,
}));

const buildClient = () => {
    const client = {
        isOpen: false,
        connect: vi.fn(async () => {
            client.isOpen = true;
        }),
        quit: vi.fn(async () => {
            client.isOpen = false;
        }),
        on: vi.fn(),
        set: vi.fn(),
        get: vi.fn(),
    };
    return client;
};

const loadRedis = async () => {
    vi.resetModules();
    const client = buildClient();
    redisMocks.createClient.mockReturnValue(client);
    const module = await import("./redis");
    return { client, ...module };
};

describe("redis helpers", () => {
    it("throws when client is not connected", async () => {
        const { getRedis } = await loadRedis();

        expect(() => getRedis()).toThrow(
            "Redis client not connected. Call connectRedis() first.",
        );
    });

    it("connects and returns client", async () => {
        const { connectRedis, client } = await loadRedis();

        const result = await connectRedis();

        expect(result).toBe(client);
        expect(client.connect).toHaveBeenCalled();
        expect(client.on).toHaveBeenCalledWith("error", expect.any(Function));
    });

    it("sets and parses json values", async () => {
        const { connectRedis, setJSON, getJSON, client } = await loadRedis();

        await connectRedis();
        await setJSON("job-1", { ok: true });

        expect(client.set).toHaveBeenCalledWith(
            "job-1",
            JSON.stringify({ ok: true }),
            { EX: 900 },
        );

        client.get.mockResolvedValueOnce(JSON.stringify({ ok: false }));

        await expect(getJSON("job-1")).resolves.toEqual({ ok: false });
    });

    it("returns null when key missing", async () => {
        const { connectRedis, getJSON, client } = await loadRedis();

        await connectRedis();
        client.get.mockResolvedValueOnce(null);

        await expect(getJSON("missing")).resolves.toBeNull();
    });

    it("quits the client", async () => {
        const { connectRedis, quitRedis, client } = await loadRedis();

        await connectRedis();
        await quitRedis();

        expect(client.quit).toHaveBeenCalled();
    });
});
