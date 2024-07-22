import { v4 as uuid } from 'uuid';
import { mdiCreditCard } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import CardEditor from './CardEditor.svelte';
import CardWidget from './CardWidget.svelte';

const info: WidgetInfo = {
    type: 'card', 
    label: 'Card',
    icon: mdiCreditCard,
    category: 'component',
    widget: CardWidget, 
    editor: CardEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'card', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;