/**
 * 图像元数据接口
 * 每一张从Word文档中提取的图片都会被包装成这个结构
 */
export interface ImageMeta {
  /** 唯一标识符 */
  id: string;

  /** 来源的Word文件对象 */
  sourceDoc: File;

  /** 在原文档中的顺序索引 */
  originalIndex: number;

  /** 原始图片二进制数据 */
  originalData: ArrayBuffer;

  /** Canvas上的当前像素数据 */
  currentState: ImageData | null;

  /** 撤销栈 - 存储历史状态 */
  history: ImageData[];

  /** 是否被修改过 */
  isModified: boolean;

  /** 图片的原始尺寸 */
  width: number;
  height: number;

  /** 图片格式 */
  format: string;
}

/**
 * 马赛克区域定义
 */
export interface MosaicRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelSize: number; // 马赛克块大小
}

/**
 * 应用状态
 */
export type AppState = 'idle' | 'loading' | 'gallery' | 'processing';
