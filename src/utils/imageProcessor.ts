import { MosaicRegion } from '../types';

/**
 * 对指定区域应用马赛克效果
 * @param imageData 原始图像数据
 * @param region 马赛克区域
 * @returns 处理后的图像数据
 */
export function applyMosaic(
  imageData: ImageData,
  region: MosaicRegion
): ImageData {
  const { x, y, width, height, pixelSize } = region;
  const data = imageData.data;
  const imgWidth = imageData.width;

  // 创建新的 ImageData 副本
  const newImageData = new ImageData(
    new Uint8ClampedArray(data),
    imgWidth,
    imageData.height
  );

  // 确保区域在图像范围内
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(imgWidth, Math.ceil(x + width));
  const endY = Math.min(imageData.height, Math.ceil(y + height));

  // 应用马赛克
  for (let blockY = startY; blockY < endY; blockY += pixelSize) {
    for (let blockX = startX; blockX < endX; blockX += pixelSize) {
      // 计算当前块的平均颜色
      let r = 0, g = 0, b = 0, a = 0, count = 0;

      const blockEndX = Math.min(blockX + pixelSize, endX);
      const blockEndY = Math.min(blockY + pixelSize, endY);

      // 采样块内所有像素
      for (let py = blockY; py < blockEndY; py++) {
        for (let px = blockX; px < blockEndX; px++) {
          const index = (py * imgWidth + px) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          a += data[index + 3];
          count++;
        }
      }

      // 计算平均值
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      a = Math.floor(a / count);

      // 将平均颜色应用到整个块
      for (let py = blockY; py < blockEndY; py++) {
        for (let px = blockX; px < blockEndX; px++) {
          const index = (py * imgWidth + px) * 4;
          newImageData.data[index] = r;
          newImageData.data[index + 1] = g;
          newImageData.data[index + 2] = b;
          newImageData.data[index + 3] = a;
        }
      }
    }
  }

  return newImageData;
}

/**
 * 从 ArrayBuffer 创建 ImageData
 * @param buffer 图片二进制数据
 * @returns Promise<ImageData>
 */
export async function createImageDataFromBuffer(
  buffer: ArrayBuffer
): Promise<ImageData> {
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      resolve(imageData);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 克隆 ImageData
 * @param imageData 原始图像数据
 * @returns 克隆的图像数据
 */
export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}
