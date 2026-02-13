import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmuDevice } from "./types";
import { EmuOs, SyncType } from "./types";
import * as backup from "./backup";

const ftpMocks = vi.hoisted(() => ({
    access: vi.fn(),
    close: vi.fn(),
    ftp: { verbose: false },
}));

const spawnMocks = vi.hoisted(() => ({
    spawn: vi.fn(),
}));

vi.mock("basic-ftp", () => ({
    Client: class {
        ftp = ftpMocks.ftp;
        access = ftpMocks.access;
        close = ftpMocks.close;
    },
}));

vi.mock("child_process", () => ({
    spawn: spawnMocks.spawn,
    default: {
        spawn: spawnMocks.spawn,
    },
}));

const buildDevice = (overrides: Partial<EmuDevice> = {}): EmuDevice => ({
    name: "Rig",
    ip: "10.0.0.10",
    port: 22,
    user: "root",
    password: "secret",
    os: EmuOs.linux,
    syncType: SyncType.ssh,
    cemuSave: undefined,
    azahar: undefined,
    dolphinDroidDump: undefined,
    dolphinGC: undefined,
    dolphinWii: undefined,
    mupenFzSave: undefined,
    nethersx2Save: undefined,
    melonds: undefined,
    pcsx2Save: undefined,
    ppssppSave: undefined,
    ppssppState: undefined,
    retroarchSave: undefined,
    retroarchState: undefined,
    rpcs3Save: undefined,
    ryujinxSave: undefined,
    switchSave: undefined,
    vita3kSave: undefined,
    xemuSave: undefined,
    xeniaSave: undefined,
    yuzuDroid: undefined,
    yuzuDroidDump: undefined,
    yuzuSave: undefined,
    workDir: "/tmp/work",
    ...overrides,
});

const mockSpawn = (stderrMessage?: string) => {
    spawnMocks.spawn.mockImplementation(() => {
        const emitter = new EventEmitter();
        const stdout = new EventEmitter();
        const stderr = new EventEmitter();
        if (stderrMessage) {
            setTimeout(() => {
                stderr.emit("data", Buffer.from(stderrMessage));
            }, 0);
        }
        setTimeout(() => emitter.emit("exit", 0), 0);
        return {
            stdout,
            stderr,
            on: emitter.on.bind(emitter),
        } as unknown as {
            stdout: EventEmitter;
            stderr: EventEmitter;
            on: (event: string, cb: (...args: unknown[]) => void) => void;
        };
    });
};

describe("backup helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSpawn();
    });

    it("builds ssh and scp commands", () => {
        const device = buildDevice();
        expect(backup.buildSshCommand(device, "ls")).toBe(
            "ssh -p 22 root@10.0.0.10 'ls'",
        );
        expect(
            backup.buildScpCommand(device, "/srv/save", "/tmp/save", true),
        ).toBe("scp -P 22 -r /srv/save root@10.0.0.10:/tmp/save");
        expect(
            backup.buildScpCommand(device, "/srv/save", "/tmp/save", false),
        ).toBe("scp -P 22 -r root@10.0.0.10:/srv/save /tmp/save");
    });

    it("runs ftp connection tests", async () => {
        ftpMocks.access.mockResolvedValue(undefined);
        const device = buildDevice({ syncType: SyncType.ftp });

        const result = await backup.connectionTest(device);

        expect(result).toBe(true);
        expect(ftpMocks.access).toHaveBeenCalledWith({
            host: device.ip,
            port: device.port,
            user: device.user,
            password: device.password,
            secure: false,
        });
        expect(ftpMocks.close).toHaveBeenCalled();
    });

    it("fails ftp connection tests on error", async () => {
        ftpMocks.access.mockRejectedValue(new Error("nope"));
        const device = buildDevice({ syncType: SyncType.ftp });

        const result = await backup.connectionTest(device);

        expect(result).toBe(false);
        expect(ftpMocks.close).toHaveBeenCalled();
    });

    it("runs ssh connection tests", async () => {
        const device = buildDevice({ syncType: SyncType.ssh });

        const result = await backup.connectionTest(device);

        expect(result).toBe(true);
        expect(spawnMocks.spawn).toHaveBeenCalledWith("bash", [
            "-c",
            backup.buildSshCommand(device, "echo hello_emusync"),
        ]);
    });

    it("returns false when ssh test fails", async () => {
        mockSpawn("ssh-error");
        const device = buildDevice({ syncType: SyncType.ssh });

        const result = await backup.connectionTest(device);

        expect(result).toBe(false);
    });
});
