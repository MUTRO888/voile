import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ImageMeta } from '../types';
import { applyMosaic, createImageDataFromBuffer, cloneImageData } from '../utils/imageProcessor';
import './Gallery.css';

interface GalleryProps {
  images: ImageMeta[];
  onImagesUpdate: (images: ImageMeta[]) => void;
  onGenerateDocuments: () => void;
}

/**
 * 画廊组件 - 流动的光影长廊
 * 用户在此浏览和编辑图片
 */
export const Gallery: React.FC<GalleryProps> = ({
  images,
  onImagesUpdate,
  onGenerateDocuments
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [mosaicSize, setMosaicSize] = useState(10);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // 初始化当前图片的 ImageData
  useEffect(() => {
    if (!currentImage || currentImage.currentState) return;

    const initImage = async () => {
      const imageData = await createImageDataFromBuffer(currentImage.originalData);
      const updatedImages = [...images];
      updatedImages[currentIndex].currentState = imageData;
      onImagesUpdate(updatedImages);
    };

    initImage();
  }, [currentIndex, currentImage]);

  // 渲染 Canvas
  useEffect(() => {
    if (!canvasRef.current || !currentImage?.currentState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    ctx.putImageData(currentImage.currentState, 0, 0);
  }, [currentImage]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  // 获取Canvas坐标
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // 鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  // 鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setCurrentPos(getCanvasCoordinates(e));
  };

  // 鼠标松开 - 应用马赛克
  const handleMouseUp = () => {
    if (!isDrawing || !currentImage?.currentState) return;

    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // 忽略太小的选区
    if (width < 5 || height < 5) {
      setIsDrawing(false);
      return;
    }

    // 保存当前状态到历史
    const updatedImages = [...images];
    const history = [...currentImage.history, cloneImageData(currentImage.currentState)];

    // 应用马赛克
    const newImageData = applyMosaic(currentImage.currentState, {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width,
      height,
      pixelSize: mosaicSize
    });

    updatedImages[currentIndex] = {
      ...currentImage,
      currentState: newImageData,
      history,
      isModified: true
    };

    onImagesUpdate(updatedImages);
    setIsDrawing(false);
  };

  // 撤销
  const handleUndo = () => {
    if (!currentImage || currentImage.history.length === 0) return;

    const updatedImages = [...images];
    const history = [...currentImage.history];
    const previousState = history.pop()!;

    updatedImages[currentIndex] = {
      ...currentImage,
      currentState: previousState,
      history,
      isModified: history.length > 0
    };

    onImagesUpdate(updatedImages);
  };

  // 渲染选择框
  const renderSelectionBox = () => {
    if (!isDrawing) return null;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return (
      <div
        className="selection-box"
        style={{
          left: `${x * scaleX}px`,
          top: `${y * scaleY}px`,
          width: `${width * scaleX}px`,
          height: `${height * scaleY}px`
        }}
      />
    );
  };

  if (!currentImage) {
    return <div className="gallery">加载中...</div>;
  }

  const modifiedCount = images.filter(img => img.isModified).length;

  return (
    <div className="gallery">
      <div
        ref={containerRef}
        className="gallery-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      >
        <canvas ref={canvasRef} className="gallery-canvas" />
        {renderSelectionBox()}
      </div>

      <div className="gallery-toolbar">
        <div className="toolbar-section">
          <button
            className="toolbar-button"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ←
          </button>

          <span className="toolbar-info">
            {currentImage.sourceDoc.name} - Image {currentImage.originalIndex + 1}
            <span className="toolbar-info-secondary">
              {currentIndex + 1} / {images.length}
            </span>
          </span>

          <button
            className="toolbar-button"
            onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
            disabled={currentIndex === images.length - 1}
          >
            →
          </button>
        </div>

        <div className="toolbar-section">
          <label className="toolbar-label">
            马赛克大小:
            <input
              type="range"
              min="5"
              max="30"
              value={mosaicSize}
              onChange={(e) => setMosaicSize(Number(e.target.value))}
              className="toolbar-slider"
            />
            <span className="toolbar-value">{mosaicSize}px</span>
          </label>
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-button"
            onClick={handleUndo}
            disabled={!currentImage.history.length}
          >
            撤销 (⌘Z)
          </button>

          <button
            className="toolbar-button toolbar-button-primary"
            onClick={onGenerateDocuments}
            disabled={modifiedCount === 0}
          >
            生成并下载 ({modifiedCount} 张已修改)
          </button>
        </div>
      </div>
    </div>
  );
};
