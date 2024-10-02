import { randomUUID } from 'crypto';
import Homey from 'homey';

type ItemMap = { [key: string]: any; }

interface Store_v1 {
  dashboards: ItemMap;
  templates: ItemMap;
}

export class DashboardDriver extends Homey.Driver {
  async onInit() {
    this.log('DashboardDriver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'Dashboard',
        data: {
          id: randomUUID(),
        },
        store: {
        },
      },
    ];
  }

  public async setDashboardSettings(storeId: string, dashboardId: string, settings: any) : Promise<void> {
    const device = this.getDevice({ id: storeId });
    const existing = device.getSettings();

    const updated: Store_v1 = {
      dashboards: {},
      templates: {}
    }

    if(existing.hasOwnProperty('dashboards') || existing.hasOwnProperty('templates')) {
      updated.dashboards = (existing as Store_v1).dashboards ?? {};
      updated.templates = (existing as Store_v1).templates ?? {};
    } else if(existing.hasOwnProperty('items')) { // Dashboard_v1
      updated.dashboards = {};
      updated.templates = {};

      // Originally the storeId was the dashboardId before converting each dashboard device to a store.
      updated.dashboards[storeId] = existing
    }

    updated.dashboards[dashboardId] = settings

    await device.setSettings(settings);
  }

  public async setTemplateSettings(storeId: string, templateId: string, settings: any) : Promise<void> {
    const device = this.getDevice({ id: storeId });
    const existing = device.getSettings();

    const updated: Store_v1 = {
      dashboards: {},
      templates: {}
    }

    if(existing.hasOwnProperty('dashboards') || existing.hasOwnProperty('templates')) {
      updated.dashboards = (existing as Store_v1).dashboards ?? {};
      updated.templates = (existing as Store_v1).templates ?? {};
    } else if(existing.hasOwnProperty('items')) { // Dashboard_v1
      updated.dashboards = {};
      updated.templates = {};

      // Originally the storeId was the dashboardId before converting each dashboard device to a store.
      updated.dashboards[storeId] = existing
    }

    updated.templates[templateId] = settings

    await device.setSettings(settings);
  }
}

module.exports = DashboardDriver;
