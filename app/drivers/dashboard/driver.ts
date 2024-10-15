import { randomUUID } from 'crypto';
import Homey from 'homey';

interface Store_v1 {
  dashboards: any[];
  templates: any[];
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

    this.log('Existing:')
    this.log(existing);

    const store: Store_v1 = {
      dashboards: [...((existing as Store_v1).dashboards ?? [])],
      templates: [...((existing as Store_v1).templates ?? [])]
    }

    if(existing.hasOwnProperty('items')) { // Dashboard_v1
      store.dashboards.push(existing)
      
      this.log('Converting to store.');
    }

    const index = store.dashboards.findIndex(d => d.id === dashboardId);

    if(index == -1) {
      store.dashboards.push(settings);
    } else {
      store.dashboards[index] = settings;
    }

    this.log('Updating dashboard  \'' + dashboardId + '\' in store \'' + storeId + '\' with ' + store.dashboards.length + ' dashboards and ' + store.templates.length + ' templates');

    await device.setSettings(store);
  }

  public async setTemplateSettings(storeId: string, templateId: string, settings: any) : Promise<void> {
    const device = this.getDevice({ id: storeId });
    const existing = device.getSettings();

    const store: Store_v1 = {
      dashboards: (existing as Store_v1).dashboards ?? [],
      templates: (existing as Store_v1).templates ?? []
    }

    if(existing.hasOwnProperty('items')) { // Dashboard_v1
      store.dashboards.push(existing)

      this.log('Converting to store.');
    }

    const index = store.templates.findIndex(d => d.id === templateId);

    if(index == -1) {
      store.dashboards.push(settings);
    } else {
      store.dashboards[index] = settings;
    }

    this.log('Updating template  \'' + templateId + '\' in store \'' + storeId + '\' with ' + store.dashboards.length + ' dashboards and ' + store.templates.length + ' templates');

    await device.setSettings(store);
  }
}

module.exports = DashboardDriver;
