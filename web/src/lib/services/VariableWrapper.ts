import type { LogicManager, Variable } from "$lib/types/Homey";
import type { ValueWrapper } from "./ValueWrapper";

export class VariableWrapper implements ValueWrapper {
    private variable: Variable;
    private manager: LogicManager;
    private callback: any | undefined;

    value: any;
    lastChanged: Date | null;
    
    constructor(_variable: Variable, _manager: LogicManager) {
        this.variable = _variable;
        this.manager = _manager;
        
        this.value = this.variable.value;
        this.lastChanged = null; // Default to null as variables has no knowledge of this.

        this.variable.on('update', () => this.updateValue());
    }
    
    destroy(): void {
        this.variable.off('update', () => this.updateValue());
    }

    async setValue(_value: any | null): Promise<void> {
        await this.manager.updateVariable({
            id: this.variable.id,
            variable: { value: _value }
        })
    }

    onValue(callback: any): void {
        this.callback = callback;
    }

    updateValue() : void {
        this.value = this.variable.value;
        this.lastChanged = new Date();

        if(this.callback !== undefined) {
            this.callback(this.value);
        }
    }
}