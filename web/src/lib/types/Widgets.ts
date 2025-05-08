import type { ComponentType } from 'svelte';

export interface WidgetSettings_v1 {
    id: string;
    type: string;
    version: number;
}

export interface WidgetContext {
    editable: boolean;
    readonly: boolean;
    
    // Called by widgets to notify the editing context that this widget is selected.
    select: (items: WidgetBreadcrumb[]) => void;

    // Called by widgets and the editor to propagate changes to settings up the tree.
    update: (settings: WidgetSettings_v1) => void;

    // Optional methods the parent widget can provide to remove a child.
    remove: ((id: string) => void) | undefined;
}

export interface WidgetBreadcrumb {
    settings: WidgetSettings_v1;
    context: WidgetContext;
}

export interface WidgetMenuContext {
    operation: 'cut' | 'copy';
    settings: WidgetSettings_v1;

    // When the operation is 'cut', the source context can be used to remove the widget from 
    // the source context.
    source: WidgetContext | undefined;
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