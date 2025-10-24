# Voile - 文档手术室

> *"A machine for living in"* — Le Corbusier

一个纯前端的、优雅的 Word 文档图像处理工具。从文档中提取图片、应用马赛克处理，并无缝写回原始文档。

## 设计哲学

Voile 融合了三种设计理念：

- **柯布西耶的结构主义**: 功能纯粹、结构诚实、光影交织
- **MUJI 的极简主义**: 质朴、克制、本质
- **瑞士国际主义**: 秩序、网格、理性

## 核心特性

### 🎯 纯前端处理
- 所有操作在浏览器中完成
- 不上传任何文件到服务器
- 完全的隐私保护

### 🖼️ 智能图像提取
- 递归遍历文件夹中的所有 Word 文档
- 自动提取所有图片
- 统一的画廊视图

### ✨ 直观的马赛克编辑
- 鼠标拖拽选择区域
- 松开鼠标立即应用马赛克
- 支持撤销操作 (⌘Z / Ctrl+Z)
- 可调节马赛克块大小

### 📦 无缝文档重组
- 自动替换修改后的图片
- 保持原始文档结构
- 一键下载所有文档

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (Rolldown)
- **文档处理**:
  - `mammoth.js` - 读取 Word 文档
  - `docxtemplater` - 修改 Word 文档
  - `jszip` - ZIP 文件处理
- **图像处理**: Canvas API

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用指南

### 第一步：选择文件夹

1. 启动应用后，你会看到一个简洁的入口界面
2. 拖拽包含 Word 文档的文件夹到界面中央
3. 或点击界面选择文件夹

### 第二步：浏览和编辑图片

1. 应用会自动提取所有图片并进入"画廊模式"
2. 使用左右箭头键或底部按钮切换图片
3. 在图片上按住鼠标左键并拖动，创建选择框
4. 松开鼠标，选中区域立即被打上马赛克
5. 使用 ⌘Z (Mac) 或 Ctrl+Z (Windows) 撤销操作

### 第三步：生成文档

1. 完成所有编辑后，点击底部的"生成并下载"按钮
2. 应用会自动生成包含修改后文档的 ZIP 文件
3. ZIP 文件会自动下载到你的电脑

## 键盘快捷键

- `←` / `→` - 切换图片
- `⌘Z` / `Ctrl+Z` - 撤销上一步操作

## 项目结构

```
voile/
├── src/
│   ├── components/          # React 组件
│   │   ├── Entrance.tsx     # 入口组件
│   │   ├── Entrance.css
│   │   ├── Gallery.tsx      # 画廊组件
│   │   └── Gallery.css
│   ├── utils/               # 工具函数
│   │   ├── documentProcessor.ts  # 文档处理
│   │   └── imageProcessor.ts     # 图像处理
│   ├── types/               # 类型定义
│   │   ├── index.ts
│   │   ├── mammoth.d.ts
│   │   └── docxtemplater.d.ts
│   ├── styles/              # 全局样式
│   │   └── global.css
│   ├── App.tsx              # 主应用
│   └── main.tsx             # 入口文件
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 浏览器兼容性

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+

需要支持以下 Web API:
- Canvas API
- File API
- Blob API
- DataTransfer API

## 注意事项

1. **文件格式**: 仅支持 `.docx` 格式（不支持旧版 `.doc`）
2. **文件大小**: 建议单个文档不超过 50MB
3. **图片数量**: 建议单次处理不超过 200 张图片
4. **浏览器内存**: 处理大量图片时可能占用较多内存

## 开发计划

- [ ] 支持更多图像处理效果（模糊、涂抹等）
- [ ] 批量操作功能
- [ ] 自定义马赛克样式
- [ ] 支持 PDF 文档
- [ ] 历史记录持久化

## 许可证

MIT License

---

**Built with ❤️ by Corbusier's Digital Successor**
