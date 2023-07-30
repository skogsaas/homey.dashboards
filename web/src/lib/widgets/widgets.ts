import type { ComponentType } from 'svelte';

import CapabilityEditor from "./capability/CapabilityEditor.svelte";
import CapabilityWidget from "./capability/CapabilityWidget.svelte";
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
        editor: CapabilityEditor
    },
    {
        type: 'image', 
        label: 'Image',
        widget: ImageWidget, 
        editor: ImageEditor,
        view: ImageView
    },
    {
        type: 'insight', 
        label: 'Insight',
        widget: InsightWidget, 
        editor: InsightEditor
    }
];

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