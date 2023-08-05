import Homey from 'homey';
import fs from 'fs-extra';
import * as crypto from 'crypto';
import path from 'path';

import * as Sentry from "@sentry/node"

export class DashboardApp extends Homey.App {
  privateKey: crypto.KeyObject | undefined;
  publicKey: crypto.KeyObject | undefined;

  async onInit() {
    await this.configureSentry();
    await this.configureAuthKeys();

    //await this.installDashboard();
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

  private async configureAuthKeys() {
    if(!this.homey.settings.get('private_key')) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 4096 });

      this.homey.settings.set('public_key', publicKey.export({ type: 'spki', format: 'pem' }) as string);
      this.homey.settings.set('private_key', privateKey.export({ type: 'pkcs8', format: 'pem' }) as string);

      this.publicKey = publicKey;
      this.privateKey = privateKey;
    } else {
      this.publicKey = crypto.createPublicKey(this.homey.settings.get('public_key'));
      this.privateKey = crypto.createPrivateKey(this.homey.settings.get('private_key'));
    }
  }

  /*
  private async installDashboard() {
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
  */

  private async updateSettings() {
    const homeyId = await this.homey.cloud.getHomeyId();
    this.homey.settings.set("homey_id", homeyId);

    const localAddress = await this.homey.cloud.getLocalAddress();
    this.homey.settings.set("local_address", localAddress);
  }
}

module.exports = DashboardApp;
