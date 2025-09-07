# AI-Powered Mermaid Markdown Editor

[**Live Demo**](https://ai-mermaid-markdown-editor-ke6b9pyr2-luojis-projects-c6616764.vercel.app/)

This is a powerful Markdown editor with real-time preview, specializing in rendering and repairing Mermaid.js diagrams with the help of AI.

---

# AI 驱动的 Mermaid Markdown 编辑器

[**在线演示**](https://ai-mermaid-markdown-editor-ke6b9pyr2-luojis-projects-c6616764.vercel.app/)

这是一款功能强大的 Markdown 编辑器，具备实时预览功能，并专注于借助 AI 渲染和修复 Mermaid.js 图表。

## Features

*   **Live Markdown Editor**: A split-screen interface where users can write Markdown on one side and see a real-time preview on the other.
*   **Mermaid.js Integration**: Supports embedding Mermaid.js diagrams within Markdown. Users can place diagram syntax in a ` ```mermaid ` code block, and the application will render it as a chart.
*   **AI-Powered Diagram Repair**: When a syntax error is detected in a Mermaid diagram, the application automatically calls the Gemini AI to attempt to fix the code. This feature requires an API key to be configured.
*   **Interactive Diagram Viewer**:
    *   Click on any diagram to open it in a full-screen modal.
    *   Supports zooming with buttons or the mouse wheel.
    *   Supports panning by dragging the diagram.
    *   The view can be reset with a reset button or by double-clicking.
*   **Diagram Export**:
    *   Supports downloading diagrams as SVG files.
    *   Supports downloading diagrams as high-resolution PNG files.
*   **Real-time Preview**: The editor automatically updates the preview as the user types, with a debouncing mechanism to optimize performance.
*   **Responsive Layout**: The editor and preview are designed to adapt to different screen sizes.

## 功能

*   **实时 Markdown 编辑器**: 分屏界面，用户可以在一侧编写 Markdown，在另一侧实时查看预览。
*   **Mermaid.js 集成**: 支持在 Markdown 中嵌入 Mermaid.js 图表。用户可以将图表语法放在 ` ```mermaid ` 代码块中，应用程序会将其渲染为图表。
*   **AI 驱动的图表修复**: 当在 Mermaid 图表中检测到语法错误时，应用程序会自动调用 Gemini AI 尝试修复代码。此功能需要配置 API 密钥。
*   **交互式图表查看器**:
    *   单击任何图表以在全屏模式下打开。
    *   支持使用按钮或鼠标滚轮进行缩放。
    *   支持通过拖动图表进行平移。
    *   可通过重置按钮或双击重置视图。
*   **图表导出**:
    *   支持将图表下载为 SVG 文件。
    *   支持将图表下载为高分辨率 PNG 文件。
*   **实时预览**: 编辑器会随着用户的输入自动更新预览，并采用防抖机制优化性能。
*   **响应式布局**: 编辑器和预览旨在适应不同的屏幕尺寸。

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Set the `GEMINI_API_KEY` in your environment variables.
3.  Run the app:
    `npm run dev`
