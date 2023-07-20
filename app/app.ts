import Homey from 'homey';
import fs from 'fs';
import path from 'path';
import extract from 'extract-zip';

class MyApp extends Homey.App {

  async onInit() {
    this.installArchive('/app/assets/build.zip', '/userdata');

    this.updateSettings();
  }

  async installArchive(archive: string, dir: string) {
    const existing = fs.readdirSync(dir);
    existing.forEach(file => {
      fs.rmSync(path.join(dir, file), { recursive: true });
    });

    await extract(archive, { dir });
  }

  async updateSettings() {
    const token = await this.homey.api.getOwnerApiToken();
    const homeyId = await this.homey.cloud.getHomeyId();

    this.homey.settings.set("token", token);
    this.homey.settings.set("homeyId", homeyId);
  }
}

module.exports = MyApp;
