import type { ComponentType } from 'svelte';

import CapabilityEditor from "./capability/CapabilityEditor.svelte";
import CapabilityWidget from "./capability/CapabilityWidget.svelte";
import FlowEditor from "./flow/FlowEditor.svelte";
import FlowWidget from "./flow/FlowWidget.svelte";
import ImageWidget from "./image/ImageWidget.svelte";
import ImageEditor from "./image/ImageEditor.svelte";
import ImageView from "./image/ImageView.svelte";
import InsightWidget from "./insight/InsightWidget.svelte";
import InsightEditor from "./insight/InsightEditor.svelte";
import UnknownWidget from '$lib/widgets/unknown/UnknownWidget.svelte';
import UnknownEditor from '$lib/widgets/unknown/UnknownEditor.svelte';

export const widgets = [
    {
        type: 'capability', 
        label: 'Capability',
        widget: CapabilityWidget, 
        editor: CapabilityEditor,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
        ]
    },
    {
        type: 'flow', 
        label: 'Flow',
        widget: FlowWidget, 
        editor: FlowEditor,
        scopes: [
            { oneOf: ['homey', 'homey.flow', 'homey.flow.start'] }
        ]
    },
    {
        type: 'image', 
        label: 'Image',
        widget: ImageWidget, 
        editor: ImageEditor,
        view: ImageView,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
        ]
    },
    {
        type: 'insight', 
        label: 'Insight',
        widget: InsightWidget, 
        editor: InsightEditor,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] },
            { oneOf: ['homey', 'homey.insights.readonly'] }
        ]
    }
];

export function findLabel(type: string) : string | undefined {
    const label = widgets.find(widget => widget.type === type)?.label;

    return label;
}

export function findWidget(type: string) : ComponentType {
    const component = widgets.find(widget => widget.type === type)?.widget;

    if(component != undefined) {
        return component;
    }

    return UnknownWidget
}

export function findEditor(type: string) : ComponentType {
    const editor = widgets.find(widget => widget.type === type)?.editor;

    if(editor != undefined) {
        return editor;
    }

    return UnknownEditor
}

export function findView(type: string) : ComponentType | undefined {
    const view = widgets.find(widget => widget.type === type)?.view;

    return view;
}

export function hasRequiredScopes(type: string, scopes: string[]) : boolean {
    const requirements = widgets.find(widget => widget.type === type)?.scopes;

    if(requirements === undefined || requirements.length === 0) {
        return true;
    }

    return requirements.every(requirement => requirement.oneOf.some((r) => scopes.includes(r)));
}