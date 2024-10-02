import Homey from 'homey';

import { DashboardDriver } from './drivers/dashboard/driver'
import { Readable } from 'stream';

export class DashboardApp extends Homey.App {
  private dashboards!: DashboardDriver;
  private webhook!: Homey.CloudWebhook;

  async onInit() {
    await this.updateSettings();
    await this.subscribeWebhook();
  }

  async onUninit() : Promise<void> {
    await this.homey.cloud.unregisterWebhook(this.webhook)
  }

  public async setDashboardSettings(storeId: string, dashboardId: string, settings: any) : Promise<void> {
    try {
      const driver = this.getStoreDriver();
      await driver.setDashboardSettings(storeId, dashboardId, settings);
    } catch(e) {
      this.log(e);
    }
  }

  public async setTemplateSettings(storeId: string, dashboardId: string, settings: any) : Promise<void> {
    try {
      const driver = this.getStoreDriver();
      await driver.setTemplateSettings(storeId, dashboardId, settings);
    } catch(e) {
      this.log(e);
    }
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

    this.webhook = await this.homey.cloud.createWebhook(id, secret, data);

    this.webhook.on('message', (args: any) => {
      const operation = args.query.operation;

      switch(operation) {
        case 'save_dashboard': 
          this.saveDashboard(args);
          break;

          case 'save_template': 
          this.saveTemplate(args);
          break;
        
        case 'active_dashboard':
          // TODO: Implement dashboard is active or inactive
          break;

        case 'save_image':
          this.saveImage(args);
          break;

        case 'delete_image':
          this.deleteImage(args);
          break;
      }
    });
  }

  private async saveDashboard(args: any) : Promise<void> {
    const storeId = args.query.storeId;
    const dashboardId = args.query.dashboardId;
    const settings = JSON.parse(args.body);

    await this.setDashboardSettings(storeId, dashboardId, settings);
  }

  private async saveTemplate(args: any) : Promise<void> {
    const storeId = args.query.storeId;
    const templateId = args.query.templateId;
    const settings = JSON.parse(args.body);

    await this.setTemplateSettings(storeId, templateId, settings);
  }

  private async saveImage(args: any) : Promise<void> {
    const buffer = Buffer.from(args.body, 'base64');
    const stream = Readable.from(buffer);

    const image = await this.homey.images.createImage();
    image.setStream((s: any) => stream.pipe(s));
  }

  private async deleteImage(args: any) : Promise<void> {
    const imageId = args.query.imageId;
    const image = await this.homey.images.getImage(imageId);

    if(image !== undefined) {
      await image.unregister();
    }
  }

  private getStoreDriver() : DashboardDriver {
    if(this.dashboards === undefined) {
      this.dashboards = (this.homey.drivers.getDriver('dashboard') as DashboardDriver);
    }

    return this.dashboards;
  }
}

module.exports = DashboardApp;
