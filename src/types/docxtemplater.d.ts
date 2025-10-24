declare module 'docxtemplater' {
  import JSZip from 'jszip';

  export default class Docxtemplater {
    constructor(zip: JSZip, options?: any);
    render(): void;
    getZip(): JSZip;
  }
}

declare module 'docxtemplater-image-module-free' {
  export default class ImageModule {
    constructor(options: any);
  }
}
