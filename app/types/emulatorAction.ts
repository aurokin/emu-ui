export type EmulatorAction = "ignore" | "push" | "pull";

export interface EmulatorActions {
    [emulatorName: string]: EmulatorAction;
}
