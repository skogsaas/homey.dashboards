import type { WidgetSettings_v1 } from "./Widgets";

export interface Template_v1 {
    id: string;
    title: string;
    root: WidgetSettings_v1;
    arguments: TemplateArgument_v1[];
}

export interface TemplateArgument_v1 {
    id: string;
    label: string | undefined;
    type: 'string' | 'number' | 'boolean' | 'capabilityId' | 'deviceId' | 'imageId' | 'iconId';
    default: any | undefined;
}

export type TemplateMap = { [key: string]: Template_v1; }