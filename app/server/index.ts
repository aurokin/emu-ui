import type { SimpleDevice, EmuDevice, EmuServer } from "./types";
import { connectRedis } from "./redis";
import { parseInfo, shouldLaunch } from "./verification";
import { convertEmuDeviceToSimpleDevice } from "./utility";

// Server state - initialized on first request
let initialized = false;
let initPromise: Promise<void> | null = null;
const simpleDevices: SimpleDevice[] = [];
const emuDevices: EmuDevice[] = [];
let emuServer: EmuServer | null = null;

export const initializeServer = async (): Promise<void> => {
    if (initialized) return;

    // Prevent multiple simultaneous initializations
    if (initPromise) {
        await initPromise;
        return;
    }

    initPromise = (async () => {
        try {
            // Initialize Redis and verify connectivity
            await connectRedis();

            const { devices, serverInfo } = await parseInfo();
            if (!serverInfo) {
                throw new Error("Server info is not valid");
            }
            emuServer = serverInfo;
            if (!(await shouldLaunch(emuServer))) {
                throw new Error(
                    "Server does not have the proper information in order to launch",
                );
            }
            emuDevices.push(...devices);
            simpleDevices.push(
                ...devices.map((device) =>
                    convertEmuDeviceToSimpleDevice(device),
                ),
            );

            initialized = true;
            console.log("Server initialized successfully");
        } catch (err) {
            console.error("Failed to initialize server:", err);
            throw err;
        }
    })();

    await initPromise;
};

export const getSimpleDevices = (): SimpleDevice[] => simpleDevices;
export const getEmuDevices = (): EmuDevice[] => emuDevices;
export const getEmuServer = (): EmuServer | null => emuServer;
export const isInitialized = (): boolean => initialized;
