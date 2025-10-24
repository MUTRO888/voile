import React, { useRef } from 'react';
import './Entrance.css';

interface EntranceProps {
  onFolderSelect: (files: FileList) => void;
}

/**
 * 入口组件 - 光影之门
 * 用户在此选择包含Word文档的文件夹
 */
export const Entrance: React.FC<EntranceProps> = ({ onFolderSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFolderSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (items) {
      // 处理拖拽的文件夹
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        const fileList = createFileList(files);
        onFolderSelect(fileList);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="entrance">
      <div
        className="entrance-container"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="entrance-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="12" y="16" width="40" height="32" stroke="currentColor" strokeWidth="2" />
            <path d="M20 16 L20 12 L44 12 L44 16" stroke="currentColor" strokeWidth="2" />
            <line x1="32" y1="28" x2="32" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="26" y1="34" x2="38" y2="34" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="entrance-title">Voile</h1>
        <p className="entrance-subtitle">文档手术室</p>

        <div className="entrance-hint">
          <p>拖拽文件夹至此</p>
          <p className="entrance-hint-secondary">或点击选择</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          /* @ts-ignore */
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

// 辅助函数：创建 FileList
function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}
