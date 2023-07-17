import Homey from 'homey';
import fs from 'fs';
import path from 'path';
import decompress from 'decompress';

class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log(process.cwd());

    this.deleteFiles('/userdata');

    await this.extractFiles('/app/assets/build.zip', '/userdata');

    this.listFiles('/userdata');
  }

  listFiles(dir: string) : void {
    fs.readdirSync(dir).forEach(file => {
      console.log(dir + ': ' + file);
    });
  }

  deleteFiles(dir: string) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
        
      fs.rmSync(filePath, { recursive: true, force: true });
    });
  }

  async extractFiles(src: string, dst: string) {
    await decompress(src, dst);
  }
}

module.exports = MyApp;
