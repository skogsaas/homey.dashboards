import { randomUUID } from 'crypto';
import Homey from 'homey';

interface Store_v1 {
  dashboards: DashboardHeader_v1[];
  templates: TemplateHeader_v1[];
}

interface DashboardHeader_v1 {
  id: string;
  title: string;
}

interface TemplateHeader_v1 {
  id: string;
  title: string;
}

export class DashboardDriver extends Homey.Driver {
  async onInit() {
    this.log('DashboardDriver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'Store',
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

    const store: Store_v1 = {
      dashboards: [...((existing as Store_v1).dashboards ?? [])],
      templates: [...((existing as Store_v1).templates ?? [])]
    }

    if(existing.hasOwnProperty('items') && 
      !existing.hasOwnProperty('dashboards') &&
      !existing.hasOwnProperty('templates')
    ) { // Dashboard_v1
      store.dashboards.push(existing)
      
      this.log('Converting to store.');
    }

    const index = store.dashboards.findIndex(dashboard => dashboard?.id === dashboardId);

    if(index == -1) {
      // Add a new dashboard
      store.dashboards.push(settings);
    } else if(settings !== null) {
      // Update the existing dashboard
      store.dashboards[index] = settings;
    } else {
      // Remove the existing dashboard
      store.dashboards = store.dashboards.filter((value, i) => i !== index && value !== null);
    }

    await device.setSettings(store);
  }

  public async setTemplateSettings(storeId: string, templateId: string, settings: any) : Promise<void> {
    const device = this.getDevice({ id: storeId });
    const existing = device.getSettings();

    const store: Store_v1 = {
      dashboards: (existing as Store_v1).dashboards ?? [],
      templates: (existing as Store_v1).templates ?? []
    }

    if(existing.hasOwnProperty('items') && 
      !existing.hasOwnProperty('dashboards') &&
      !existing.hasOwnProperty('templates')
    ) { // Dashboard_v1
      store.dashboards.push(existing)

      this.log('Converting to store.');
    }

    const index = store.templates.findIndex(template => template?.id === templateId);

    if(index == -1) {
      store.templates.push(settings);
    } else {
      if(settings !== null) {
        store.templates[index] = settings;
      } else {
        store.templates = store.templates.filter((value, i) => i !== index && value !== null);
      }
    }

    await device.setSettings(store);
  }
}

module.exports = DashboardDriver;
