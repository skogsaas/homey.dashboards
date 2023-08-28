import { randomUUID } from 'crypto';
import Homey from 'homey';

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

  public async setDashboardSettings(id: string, settings: any) : Promise<void> {
    const device = this.getDevice({ id });

    await device.setSettings(settings);
  }
}

module.exports = DashboardDriver;
