import Homey from 'homey';

import * as Sentry from "@sentry/node"

export class DashboardApp extends Homey.App {
  async onInit() {
    await this.configureSentry();
    await this.updateSettings();
  }

  async onUninit() : Promise<void> {
    await Sentry.flush();
  }

  private async configureSentry() {
    Sentry.init({
      dsn: Homey.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });

    const homeyId = await this.homey.cloud.getHomeyId();

    Sentry.setTags({
      appId: Homey.manifest.id,
      appVersion: Homey.manifest.version,
      homeyVersion: this.homey.version,
      homeyId: homeyId
    });
  }

  private async updateSettings() {
    const homeyId = await this.homey.cloud.getHomeyId();
    this.homey.settings.set("homey_id", homeyId);

    const localAddress = await this.homey.cloud.getLocalAddress();
    this.homey.settings.set("local_address", localAddress);
  }
}

module.exports = DashboardApp;
