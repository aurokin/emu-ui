export type EmulatorAction = "ignore" | "push" | "pull";

export interface EmulatorActions {
    [emulatorName: string]: EmulatorAction;
}

// Single emulator/action pair for list-based usage
export interface EmulatorActionItem {
    emulator: string;
    action: EmulatorAction;
}
