import Homey from 'homey';

import * as Sentry from "@sentry/node"
import { DashboardDriver } from './drivers/dashboard/driver'
import { Readable } from 'stream';

export class DashboardApp extends Homey.App {
  private dashboards!: DashboardDriver;

  async onInit() {
    await this.configureSentry();
    await this.updateSettings();
    await this.subscribeWebhook();
  }

  async onUninit() : Promise<void> {
    await Sentry.flush();
  }

  public async setDashboardSettings(dashboardId: string, settings: any) : Promise<void> {
    try {
      const driver = this.getDashboardDriver();
      await driver.setDashboardSettings(dashboardId, settings);
    } catch(e) {
      this.log(e);
      Sentry.captureException(e);
    }
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

    const platform = (this.homey as any).platform;
    this.homey.settings.set("platform", platform);

    const platformVersion = (this.homey as any).platformVersion;
    this.homey.settings.set("platform_version", platformVersion);

    const localAddress = await this.homey.cloud.getLocalAddress();
    this.homey.settings.set("local_address", localAddress);
  }

  private async subscribeWebhook() {
    const id = Homey.env.WEBHOOK_ID;
    const secret = Homey.env.WEBHOOK_SECRET;
    const data = {};

    const webhook = await this.homey.cloud.createWebhook(id, secret, data);

    webhook.on('message', args => {
      const operation = args.query.operation;

      switch(operation) {
        case 'save_dashboard': 
          this.saveDashboard(args);
          break;
        
        case 'active_dashboard':
          // TODO: Implement dashboard is active or inactive
          break;

        case 'save_image':
          this.saveImage(args);
          break;

        case 'delete_image':
          break;
      }
    });
  }

  private async saveDashboard(args: any) : Promise<void> {
    const dashboardId = args.query.dashboardId;
    const settings = JSON.parse(args.body);

    await this.setDashboardSettings(dashboardId, settings);
  }

  private async saveImage(args: any) : Promise<void> {
    const buffer = Buffer.from(args.body, 'base64');
    const stream = Readable.from(buffer);

    const image = await this.homey.images.createImage();
    image.setStream((s: any) => stream.pipe(s));
  }

  private getDashboardDriver() : DashboardDriver {
    if(this.dashboards === undefined) {
      this.dashboards = (this.homey.drivers.getDriver('dashboard') as DashboardDriver);
    }

    return this.dashboards;
  }
}

module.exports = DashboardApp;
