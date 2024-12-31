export interface ValueWrapper {
    destroy() : void;

    value: any | null;
    lastChanged: Date | null;

    setValue(_value: any | null) : Promise<void>;
    onValue(callback: any) : void;
}