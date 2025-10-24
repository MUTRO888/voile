import { useState } from 'react';
import { Entrance } from './components/Entrance';
import { Gallery } from './components/Gallery';
import { ImageMeta, AppState } from './types';
import { processFolder, generateModifiedDocuments } from './utils/documentProcessor';
import './styles/global.css';

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 处理文件夹选择
  const handleFolderSelect = async (files: FileList) => {
    try {
      setAppState('loading');
      setError(null);

      const extractedImages = await processFolder(files);

      if (extractedImages.length === 0) {
        setError('未在文件夹中找到包含图片的Word文档');
        setAppState('idle');
        return;
      }

      setImages(extractedImages);
      setAppState('gallery');
    } catch (err) {
      console.error('处理文件夹时出错:', err);
      setError('处理文件时出错，请重试');
      setAppState('idle');
    }
  };

  // 更新图片数据
  const handleImagesUpdate = (updatedImages: ImageMeta[]) => {
    setImages(updatedImages);
  };

  // 生成并下载修改后的文档
  const handleGenerateDocuments = async () => {
    try {
      setAppState('processing');

      const zipBlob = await generateModifiedDocuments(images);

      // 触发下载
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voile-modified-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAppState('gallery');
    } catch (err) {
      console.error('生成文档时出错:', err);
      setError('生成文档时出错，请重试');
      setAppState('gallery');
    }
  };

  // 渲染加载状态
  if (appState === 'loading') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--concrete-base)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--concrete-base)',
          borderTop: '3px solid var(--concrete-dark)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--concrete-dark)', fontSize: '14px' }}>
          正在提取图片...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 渲染处理状态
  if (appState === 'processing') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--concrete-darker)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
          正在生成文档...
        </p>
      </div>
    );
  }

  // 渲染错误
  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--concrete-base)'
      }}>
        <p style={{ color: 'var(--concrete-dark)', fontSize: '14px' }}>
          {error}
        </p>
        <button
          onClick={() => {
            setError(null);
            setAppState('idle');
          }}
          style={{
            padding: '8px 16px',
            background: 'var(--concrete-dark)',
            color: 'white',
            borderRadius: '2px',
            fontSize: '13px'
          }}
        >
          返回
        </button>
      </div>
    );
  }

  // 渲染主界面
  return (
    <>
      {appState === 'idle' && <Entrance onFolderSelect={handleFolderSelect} />}
      {appState === 'gallery' && (
        <Gallery
          images={images}
          onImagesUpdate={handleImagesUpdate}
          onGenerateDocuments={handleGenerateDocuments}
        />
      )}
    </>
  );
}

export default App;
