import CapabilityEditor from "./capability/CapabilityEditor.svelte";
import CapabilityWidget from "./capability/CapabilityWidget.svelte";

export default [
    {
        component: CapabilityWidget, editor: CapabilityEditor, type: 'capability', label: 'Capability'
    }
];