import mammoth from 'mammoth';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { ImageMeta } from '../types';

/**
 * 从Word文档中提取所有图片
 * @param file Word文档文件
 * @returns 图片元数据数组
 */
export async function extractImagesFromDoc(
  file: File,
  startIndex: number
): Promise<ImageMeta[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 使用 mammoth 解析文档
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((imageBuffer) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`
          };
        });
      })
    }
  );

  // 从HTML中提取所有图片
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');
  const images = doc.querySelectorAll('img');

  const imageMetas: ImageMeta[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = img.src;

    // 解析 base64 数据
    const base64Data = src.split(',')[1];
    const format = src.split(';')[0].split(':')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }

    const arrayBuffer = bytes.buffer;

    // 创建临时图片以获取尺寸
    const tempImg = new Image();
    await new Promise((resolve) => {
      tempImg.onload = resolve;
      tempImg.src = src;
    });

    imageMetas.push({
      id: `${file.name}-${startIndex + i}`,
      sourceDoc: file,
      originalIndex: i,
      originalData: arrayBuffer,
      currentState: null,
      history: [],
      isModified: false,
      width: tempImg.width,
      height: tempImg.height,
      format
    });
  }

  return imageMetas;
}

/**
 * 递归遍历文件夹，提取所有Word文档中的图片
 * @param files 文件列表
 * @returns 所有图片的元数据数组
 */
export async function processFolder(files: FileList): Promise<ImageMeta[]> {
  const allImages: ImageMeta[] = [];
  let globalIndex = 0;

  // 过滤出所有 .docx 文件
  const docxFiles = Array.from(files).filter(
    file => file.name.endsWith('.docx') && !file.name.startsWith('~$')
  );

  for (const file of docxFiles) {
    try {
      const images = await extractImagesFromDoc(file, globalIndex);
      allImages.push(...images);
      globalIndex += images.length;
    } catch (error) {
      console.error(`处理文件 ${file.name} 时出错:`, error);
    }
  }

  return allImages;
}

/**
 * 将修改后的图片写回Word文档
 * @param imageMetas 图片元数据数组
 * @returns 包含所有文档的ZIP文件
 */
export async function generateModifiedDocuments(
  imageMetas: ImageMeta[]
): Promise<Blob> {
  const zip = new JSZip();

  // 按源文档分组
  const docGroups = new Map<File, ImageMeta[]>();

  for (const meta of imageMetas) {
    if (!docGroups.has(meta.sourceDoc)) {
      docGroups.set(meta.sourceDoc, []);
    }
    docGroups.get(meta.sourceDoc)!.push(meta);
  }

  // 处理每个文档
  for (const [sourceDoc, images] of docGroups.entries()) {
    const hasModifications = images.some(img => img.isModified);

    if (hasModifications) {
      // 需要修改的文档
      const modifiedDoc = await replaceImagesInDoc(sourceDoc, images);
      zip.file(sourceDoc.name, modifiedDoc);
    } else {
      // 未修改的文档，直接添加原文件
      zip.file(sourceDoc.name, sourceDoc);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * 替换Word文档中的图片
 * @param sourceDoc 源文档
 * @param images 图片元数据数组
 * @returns 修改后的文档二进制数据
 */
async function replaceImagesInDoc(
  sourceDoc: File,
  images: ImageMeta[]
): Promise<ArrayBuffer> {
  const content = await sourceDoc.arrayBuffer();
  const zip = new JSZip();
  await zip.loadAsync(content);

  // 创建图片映射
  const imageMap = new Map<number, Blob>();

  for (const img of images) {
    if (img.isModified && img.currentState) {
      // 将 ImageData 转换为 Blob
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(img.currentState, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), img.format);
      });

      imageMap.set(img.originalIndex, blob);
    }
  }

  // 使用 docxtemplater 替换图片
  const imageModule = new ImageModule({
    centered: false,
    getImage: (tagValue: string) => {
      const index = parseInt(tagValue);
      return imageMap.get(index);
    },
    getSize: () => {
      return [600, 450]; // 默认尺寸
    }
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true
  });

  // 渲染文档
  doc.render();

  return await doc.getZip().generateAsync({ type: 'arraybuffer' });
}
