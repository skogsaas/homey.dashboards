import { alerts as alertStore } from '$lib/stores/alerting';
import type { Alert } from '$lib/stores/alerting'

export class AlertManager {
    private interval: number;
    private subscription: any;

    private alerts: Alert[];

    constructor() {
        this.alerts = [];

        this.interval = setInterval(() => this.removeAlerts(), 500);
        this.subscription = alertStore.subscribe(value => this.onUpdate(value));
    }

    onUpdate(_alerts: Alert[]) {
        this.alerts = _alerts;
    }

    removeAlerts() : void {
        const now = Date.now();
        const expired = this.alerts
            .filter(alert => alert.expires < now)
            .forEach(alert => alertStore.remove(alert.id));
    }
}