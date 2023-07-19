import CapabilityEditor from "./capability/CapabilityEditor.svelte";
import CapabilityWidget from "./capability/CapabilityWidget.svelte";
import ImageWidget from "./image/ImageWidget.svelte";
import ImageEditor from "./image/ImageEditor.svelte";

export default [
    {
        component: CapabilityWidget, editor: CapabilityEditor, type: 'capability', label: 'Capability'
    },
    {
        component: ImageWidget, editor: ImageEditor, type: 'image', label: 'Image'
    }
];