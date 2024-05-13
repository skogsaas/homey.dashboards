export interface WidgetSettings {
    id: string;
    type: string;
    version: number;
}

export interface WidgetContext {
    mode: 'card'|'view';
    editing: boolean;
    select: ((id: string) => void);
    update: ((settings: WidgetSettings) => void)
}

export interface Threshold {
    id: string;
    color: string;
    value: number;
}

export type WidgetSettingsMap = { [key: string]: WidgetSettings; }