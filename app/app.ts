import Homey from 'homey';
import fs from 'fs';
import path from 'path';
import extract from 'extract-zip';
import {randomUUID } from 'crypto';

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
    const homeyToken = await this.homey.api.getOwnerApiToken();
    const homeyId = await this.homey.cloud.getHomeyId();

    this.homey.settings.set("homey_token", homeyToken);
    this.homey.settings.set("homey_id", homeyId);

    // A static random UUID is used as token for the app api for now. 
    // This should be replaced with a JWT-looking token in the future, 
    // allowing token expire, scopes and refreshing tokens.
    if(!this.homey.settings.get('app_token')) {
      this.homey.settings.set('app_token', randomUUID())
    }
  }
}

module.exports = MyApp;
