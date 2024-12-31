import type { DeviceCapability, DeviceObj } from "$lib/types/Homey";
import type { ValueWrapper } from "./ValueWrapper";

export class CapabilityWrapper implements ValueWrapper {
    private capability: DeviceCapability;
    private callback: any | undefined;

    value: any;
    lastChanged: Date | null;

    constructor(_device: DeviceObj, capabilityId: string) {
        this.capability = _device.makeCapabilityInstance(capabilityId, (_value: any) => this.updateValue(_value));
        
        this.value = this.capability.value;
        this.lastChanged = this.capability.lastChanged;
    }
    
    destroy(): void {
        this.capability.destroy();
    }

    async setValue(_value: any | null): Promise<void> {
        await this.capability.device.setCapabilityValue({ 
            capabilityId: this.capability.id, 
            deviceId: this.capability.device.id,
            value: _value
        })
    }

    onValue(callback: any): void {
        this.callback = callback;
    }

    updateValue(_value: any) : void {
        this.value = _value;
        this.lastChanged = this.capability.lastChanged;

        if(this.callback !== undefined) {
            this.callback(this.value);
        }
    }
}