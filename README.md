# OpenNotebookLM

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.10-000000?style=flat-square&logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.1-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google" alt="Gemini">
</p>

<p align="center">
  <b>🧠 An open-source alternative to Google NotebookLM, powered by Gemini AI</b>
</p>

<p align="center">
  <a href="https://opennotebooklm.xi-n.com">🌐 在线体验 / Live Demo</a>
</p>

---

## ✨ 功能特性 / Features

- 📚 **多来源知识库** - 支持 PDF 文档、文本、网页链接等多种来源格式
- 💬 **AI 智能对话** - 基于 Gemini 2.5 Flash 的上下文感知对话
- 📝 **智能笔记生成** - 一键生成摘要、FAQ、学习指南等
- 🎙️ **播客脚本生成** - 将知识库内容转换为双人播客脚本
- 🗂️ **笔记本管理** - 创建和管理多个知识库笔记本
- ⚡ **流式响应** - 实时流式输出 AI 回复，体验流畅

## 🖼️ 预览 / Preview

> 访问 [在线演示](https://opennotebooklm.xi-n.com) 体验完整功能

## 🛠️ 技术栈 / Tech Stack

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 16 (App Router) |
| **前端** | React 19 + TypeScript |
| **样式** | TailwindCSS 4 |
| **AI 模型** | Google Gemini 2.5 Flash |
| **PDF 解析** | PDF.js |
| **图标** | Lucide React |

## 🚀 快速开始 / Quick Start

### 前置要求 / Prerequisites

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [Gemini API Key](https://aistudio.google.com/app/apikey) (免费获取)

### 安装步骤 / Installation

1. **克隆仓库 / Clone the repository**
   ```bash
   git clone https://github.com/your-username/OpenNotebookLM.git
   cd OpenNotebookLM
   ```

2. **安装依赖 / Install dependencies**
   ```bash
   npm install
   ```

3. **配置环境变量 / Configure environment variables**
   
   创建 `.env.local` 文件并添加你的 API Key:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```

4. **启动开发服务器 / Start development server**
   ```bash
   npm run dev
   ```

5. **访问应用 / Access the app**
   
   打开浏览器访问 `http://localhost:3000`

## 📁 项目结构 / Project Structure

```
OpenNotebookLM/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 根布局组件
│   ├── page.tsx              # 首页路由
│   ├── globals.css           # 全局样式
│   └── notebook/             # 笔记本路由
│       └── page.tsx          # 笔记本页面
├── components/               # React 组件
│   ├── Home.tsx              # 首页组件
│   ├── Notebook.tsx          # 笔记本主界面
│   └── SourceModal.tsx       # 来源添加弹窗
├── services/
│   └── geminiService.ts      # Gemini AI 服务封装
├── lib/
│   └── notebookStore.ts      # 笔记本状态管理
├── types.ts                  # TypeScript 类型定义
├── next.config.ts            # Next.js 配置
├── postcss.config.mjs        # PostCSS 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

## 📖 使用指南 / Usage Guide

### 创建笔记本
1. 在首页点击 **"Create"** 按钮创建新的笔记本
2. 点击笔记本卡片进入详情页

### 添加知识来源
- **PDF 文档**: 上传 PDF 文件，系统会自动提取文本内容
- **文本内容**: 直接粘贴文本作为知识来源
- **网页链接**: 输入 URL，系统会抓取网页内容

### 与 AI 对话
- 在右侧对话区域输入问题，AI 会基于你添加的知识来源回答
- 支持流式输出，实时查看 AI 回复

### 生成笔记内容
- **摘要**: 一键总结所有来源的关键信息
- **FAQ**: 根据来源生成常见问题及答案
- **学习指南**: 生成包含关键术语和测验题的学习材料
- **播客脚本**: 将知识转换为两人对话形式的播客脚本

## ⚙️ 可用脚本 / Available Scripts

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 (默认端口 3000) |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产版本 |
| `npm run lint` | 运行 ESLint 代码检查 |

## 🤝 贡献 / Contributing

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 📄 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢 / Acknowledgments

- [Google NotebookLM](https://notebooklm.google/) - 项目灵感来源
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI 大模型支持
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Vercel](https://vercel.com/) - 部署平台

---

<p align="center">
  如果这个项目对你有帮助，请给一个 ⭐ Star！
  <br>
  If this project helps you, please give it a ⭐ Star!
</p>
