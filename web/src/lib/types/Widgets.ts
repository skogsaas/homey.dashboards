import type { ComponentType } from 'svelte';

export interface WidgetSettings_v1 {
    id: string;
    type: string;
    version: number;
}

export interface WidgetContext {
    editable: boolean;
    readonly: boolean;
    breadcrumbs: WidgetBreadcrumb[];
    select: (items: WidgetBreadcrumb[]) => void;
}

export interface WidgetBreadcrumb {
    settings: WidgetSettings_v1;
    update: (settings: WidgetSettings_v1) => void
}

export interface WidgetCategory {
    id: string;
    label: string;
}

export interface WidgetInfo {
    type: string;
    label: string;
    icon: string;
    category: 'layout' | 'logic' | 'component';
    widget: ComponentType;
    editor: ComponentType;
    scopes: { oneOf: string[] }[];
    create: () => WidgetSettings_v1;
    migration: (e: WidgetSettings_v1) => WidgetSettings_v1;
    deprecated?: boolean;
}

export interface Threshold {
    id: string;
    color: string;
    value: number;
}