import type { Triggerable } from '$lib/stores/events';
import type { ComponentType } from 'svelte';
import type { Readable, Writable } from 'svelte/store';

export interface WidgetSettings_v1 {
    id: string;
    type: string;
    version: number;
}

export interface WidgetContext {
    editable: boolean;
    readonly: boolean;

    data: { [key: string]: WidgetDataObject };
    
    // Called by widgets to notify the editing context that this widget is selected.
    select: (items: WidgetBreadcrumb[]) => void;

    // Called by widgets and the editor to propagate changes to settings up the tree.
    update: (settings: WidgetSettings_v1) => void;

    // Optional methods the parent widget can provide to remove a child.
    remove: ((id: string) => void) | undefined;
}

export interface WidgetDataObject {
    label: string;
    description?: string;
    type: 'void' | 'string' | 'number' | 'boolean' | 'enum' | 'zone' | 'device' | 'capability' | 'variable' | 'flow' | 'widget';
    parentId?: string;
    enums?: { [key: string]: string | number | boolean };
    states: { [key: string]: WidgetState };
    events: { [key: string]: WidgetEvent };
    actions: { [key: string]: WidgetAction };
}

export interface WidgetState {
    label: string;
    description?: string;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'icon';
    enums?: { [key: string]: string | number | boolean };
    writable: boolean;
    value: Readable<any> | Writable<any>;
}

export interface WidgetEvent {
    label: string;
    description?: string;
    type: 'void' | 'string' | 'number' | 'boolean' | 'enum';
    enums?: { [key: string]: string | number | boolean };
    trigger: Triggerable<any>;
}

export interface WidgetAction {
    label: string;
    description?: string;
    arguments: WidgetActionArgument[];
    action: (args: object) => Promise<void>;
}

export interface WidgetActionArgument {
    id: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    optional?: boolean;
    default?: any;
    enums?: { [key: string]: string | number | boolean };
}

export interface WidgetStateBinding {
    objectId: string;
    stateId: string;
}

export interface WidgetActionBinding {
    whenObjectId: string;
    whenId: string;
    thenObjectId: string;
    thenId: string;
    arguments: { [key: string]: WidgetActionBindingArgument };
}

export interface WidgetActionBindingArgument {
    type: 'event' | 'state' | 'string' | 'number' | 'boolean';
    value: string | number | boolean;
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