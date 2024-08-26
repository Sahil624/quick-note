import { ScullyConfig, setPluginConfig } from '@scullyio/scully';
import '@scullyio/scully-plugin-puppeteer';


export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'quick-notes',
  distFolder: './dist/quick-notes/browser', // output directory of your Angular build artifacts
  outDir: './dist/static', // directory for scully build artifacts
  defaultPostRenderers: [],
  routes: {},
};