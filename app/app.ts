import Homey from 'homey';
import fs from 'fs';
import path from 'path';
import extract from 'extract-zip';

class MyApp extends Homey.App {

  async onInit() {
    this.installArchive('/app/assets/build.zip', '/userdata');
  }

  async installArchive(archive: string, dir: string) {
    const existing = fs.readdirSync(dir);
    existing.forEach(file => {
      fs.rmSync(path.join(dir, file), { recursive: true });
    });

    await extract(archive, { dir });
  }
}

module.exports = MyApp;
