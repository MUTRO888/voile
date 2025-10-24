declare module 'mammoth' {
  export interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    convertImage?: any;
  }

  export interface ConvertResult {
    value: string;
    messages: any[];
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: any
  ): Promise<ConvertResult>;

  export const images: {
    imgElement: (func: (image: any) => Promise<any>) => any;
  };
}
