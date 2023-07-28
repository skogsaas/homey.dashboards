import Homey from 'homey';
import fs from 'fs-extra';
import { randomUUID } from 'crypto';
import path from 'path';

import * as Sentry from "@sentry/node"

class DashboardApp extends Homey.App {
  async onInit() {
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
    
    await this.installDashboard();
    await this.updateSettings();
  }

  async onUninit() {
    await Sentry.flush();
  }

  async installDashboard() {
    const source = '/app/assets/dashboard';
    const destination = '/userdata';

    try {
      // Delete content of destination folder
      const existing = fs.readdirSync(destination);
      existing.forEach(file => {
        fs.rmSync(path.join(destination, file), { recursive: true });
      });
      
      // Copy new content to destination folder
      await fs.copy(source, destination);
    } catch(error) {
      const src = fs.readdirSync(source).map(e => path.join(source, e)).join('\n');
      const dst = fs.readdirSync(destination).map(e => path.join(destination, e)).join('\n');

      Sentry.captureException(error, { extra: { src, dst }});
      Sentry.flush();
    }
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
      this.homey.settings.set('app_token', randomUUID());
    }
  }
}

module.exports = DashboardApp;
