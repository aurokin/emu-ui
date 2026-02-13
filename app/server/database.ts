import fs from "node:fs/promises";
import type { EmuDevice, EmuServer } from "./types";
import { verifyDevices, verifyServer } from "./verification";

// Database structure matching db.json
interface Database {
    devices: Record<string, unknown>[];
    server: Record<string, unknown>;
}

// Get database path from environment or default
const getDbPath = (): string => {
    return process.env.DB_PATH || "./db.json";
};

// Load database from file
export const loadDatabase = async (): Promise<Database> => {
    const dbPath = getDbPath();
    const content = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(content) as Database;
};

// Save database to file with atomic write
export const saveDatabase = async (data: Database): Promise<void> => {
    const dbPath = getDbPath();
    const tempPath = `${dbPath}.tmp`;

    // Write to temp file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 4), "utf-8");

    // Rename atomically
    await fs.rename(tempPath, dbPath);
};

// Get current server configuration
export const getServerConfig = async (): Promise<EmuServer | null> => {
    const db = await loadDatabase();
    return verifyServer(db.server);
};

// Update server configuration
export const updateServerConfig = async (
    updates: Partial<EmuServer>,
): Promise<EmuServer | null> => {
    const db = await loadDatabase();
    db.server = { ...db.server, ...updates };
    await saveDatabase(db);
    return verifyServer(db.server);
};

// Get all devices (raw from db.json, before verification transforms)
export const getRawDevices = async (): Promise<Record<string, unknown>[]> => {
    const db = await loadDatabase();
    return db.devices;
};

// Get all devices (verified)
export const getDevices = async (): Promise<EmuDevice[]> => {
    const db = await loadDatabase();
    return verifyDevices(db.devices);
};

// Get a single device by name
export const getDevice = async (
    name: string,
): Promise<Record<string, unknown> | null> => {
    const db = await loadDatabase();
    const device = db.devices.find(
        (d) => (d as { name?: string }).name === name,
    );
    return device || null;
};

// Add a new device
export const addDevice = async (
    device: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> => {
    const db = await loadDatabase();

    // Check for duplicate name
    const existingIndex = db.devices.findIndex(
        (d) => (d as { name?: string }).name === device.name,
    );
    if (existingIndex !== -1) {
        return {
            success: false,
            error: "Device with this name already exists",
        };
    }

    db.devices.push(device);
    await saveDatabase(db);
    return { success: true };
};

// Update an existing device
export const updateDevice = async (
    name: string,
    updates: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> => {
    const db = await loadDatabase();

    const index = db.devices.findIndex(
        (d) => (d as { name?: string }).name === name,
    );
    if (index === -1) {
        return { success: false, error: "Device not found" };
    }

    // If name is being changed, check for conflicts
    if (updates.name && updates.name !== name) {
        const conflictIndex = db.devices.findIndex(
            (d) => (d as { name?: string }).name === updates.name,
        );
        if (conflictIndex !== -1) {
            return {
                success: false,
                error: "A device with that name already exists",
            };
        }
    }

    // Merge updates with existing device
    db.devices[index] = { ...db.devices[index], ...updates };
    await saveDatabase(db);
    return { success: true };
};

// Delete a device
export const deleteDevice = async (
    name: string,
): Promise<{ success: boolean; error?: string }> => {
    const db = await loadDatabase();

    const index = db.devices.findIndex(
        (d) => (d as { name?: string }).name === name,
    );
    if (index === -1) {
        return { success: false, error: "Device not found" };
    }

    db.devices.splice(index, 1);
    await saveDatabase(db);
    return { success: true };
};
