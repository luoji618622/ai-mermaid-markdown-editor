import React, { useState, useCallback, useRef } from 'react';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { useDebounce } from './hooks/useDebounce';
import { isAIAvailable } from './services/geminiService';

const initialMarkdown = `# Mermaid.js Live Editor

This is a simple live editor for Markdown that includes support for Mermaid.js diagrams.

## Markdown Example

You can write standard Markdown here, like:
- **Bold text**
- *Italic text*
- \`inline code\`

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## Mermaid Diagram Example

Below is a Mermaid diagram. Try editing it!

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?};
    B -- Yes --> C[Great!];
    B -- No --> D(Check console);
    D --> B;
\`\`\`

## Diagram with a common error

Mermaid syntax doesn't allow parentheses '()' in node text without quotes. The AI will attempt to fix it for you. Try the example below.

\`\`\`mermaid
graph TD
    A[Start] --> B(This node is broken);
\`\`\`
`;


function App() {
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const debouncedMarkdown = useDebounce(markdown, 500);
  const [selectedSvg, setSelectedSvg] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  // 添加拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback((svg: string) => {
    setSelectedSvg(svg);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 }); // 重置位置
  }, []);

  const handleCloseModal = () => {
    setSelectedSvg(null);
  };
  
  const downloadSvg = () => {
    if (!selectedSvg) return;
    const blob = new Blob([selectedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 添加缩放功能
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 5)); // 增加最大缩放到5倍
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.2)); // 最小缩小到0.2倍
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // 修改鼠标滚轮缩放功能
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // 直接使用滚轮进行缩放，无需按住 Ctrl 键
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.2), 5));
  };

  // 添加拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    e.currentTarget.style.cursor = 'grab';
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsDragging(false);
    e.currentTarget.style.cursor = 'grab';
  };

  // 添加双击重置功能
  const handleDoubleClick = () => {
    handleResetZoom();
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <header className="bg-slate-800/50 border-b border-slate-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-200">
          Mermaid.js {isAIAvailable() ? 'AI-Powered ' : ''}Editor
        </h1>
        {isAIAvailable() ? (
          <a href="https://developers.google.com/gemini/tutorials/node_quickstart" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Built with Gemini API
          </a>
        ) : (
          <div className="text-slate-400 text-sm">
            设置API密钥以启用AI功能
          </div>
        )}
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4" style={{ height: 'calc(100vh - 73px)'}}>
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
        <MarkdownPreview markdown={debouncedMarkdown} onImageClick={handleImageClick} />
      </main>

      {selectedSvg && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-slate-800 rounded-lg shadow-2xl flex flex-col w-full h-full max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold">Diagram Preview (Scroll to zoom, Drag to move)</h3>
              <div className="flex items-center space-x-2">
                {/* 添加缩放控制按钮 */}
                <button
                  onClick={handleZoomOut}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors text-sm font-medium"
                >
                  -
                </button>
                <span className="text-sm text-slate-300 min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors text-sm font-medium"
                >
                  +
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={downloadSvg}
                  className="mx-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white transition-colors text-sm font-medium"
                >
                  Download SVG
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-md text-white transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
            {/* 修改后的 SVG 容器，支持直接滚轮缩放 */}
            <div 
              className="flex-grow bg-slate-900 p-4"
            >
              <div 
                className="w-full h-full cursor-grab relative overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleDoubleClick}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center origin-center"
                  style={{ 
                    transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                  }}
                >
                  <div 
                    className="bg-white rounded p-4 inline-block"
                    dangerouslySetInnerHTML={{ __html: selectedSvg }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
