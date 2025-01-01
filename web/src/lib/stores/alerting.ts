import { writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

export interface Alert {
    id: string;
    expires: number;
    title: string;
    text: string;
    icon: string | undefined;
    classes: string;
}

function createAlerts() {
    const { subscribe, set, update } = writable([] as Alert[]);

    return {
        subscribe,
        set,
        plain: (title: string, text: string, timeout: number) => {
            const alert = createAlert(title, text, timeout, undefined, '');
            update((existing: Alert[]) => ([ ...existing, alert ]));
        },
        info: (title: string, text: string, timeout: number) => {
            const alert = createAlert(title, text, timeout, 'information', 'alert-info');
            update((existing: Alert[]) => ([ ...existing, alert ]));
        },
        warn: (title: string, text: string, timeout: number) => {
            const alert = createAlert(title, text, timeout, 'alert', 'alert-warning');
            update((existing: Alert[]) => ([ ...existing, alert ]));
        },
        error: (title: string, text: string, timeout: number) => {
            const alert = createAlert(title, text, timeout, 'skull-crossbones', 'alert-error');
            update((existing: Alert[]) => ([ ...existing, alert ]));
        },
        success: (title: string, text: string, timeout: number) => {
            const alert = createAlert(title, text, timeout, 'check', 'alert-success');
            update((existing: Alert[]) => ([ ...existing, alert ]));
        },
        remove: (id: string) => update((existing: Alert[]) => existing.filter(alert => alert.id === id))
    };
}

function createAlert(title: string, text: string, timeout: number, icon: string | undefined, classes: string) : Alert {
    return {
        id: uuid(),
        expires: Date.now() + timeout,
        title,
        text,
        icon,
        classes
    };
}

export const alerts = createAlerts();