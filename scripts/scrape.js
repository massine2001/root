if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File extends ArrayBuffer {
    constructor(bits = [], name = 'file') {
      super(0);
      this.name = name;
      this._bits = bits;
    }
  };
}

import('./scrape.impl.js').catch((e) => {
  console.error('Failed to run scraper implementation:', e);
  process.exit(1);
});
