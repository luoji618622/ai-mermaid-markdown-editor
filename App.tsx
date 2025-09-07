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
    a.download = 'mermaid-diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!selectedSvg) return;
    
    try {
      // 创建一个临时的SVG元素来获取尺寸和修复SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedSvg;
      const svgElement = tempDiv.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('无法找到SVG元素');
      }

      // 确保SVG有正确的命名空间
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // 获取SVG的尺寸，优先使用viewBox
      let width = 800;
      let height = 600;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        width = vbWidth || width;
        height = vbHeight || height;
      } else {
        // 尝试从width和height属性获取
        const svgWidth = svgElement.getAttribute('width');
        const svgHeight = svgElement.getAttribute('height');
        
        if (svgWidth && !svgWidth.includes('%')) {
          width = parseInt(svgWidth) || width;
        }
        if (svgHeight && !svgHeight.includes('%')) {
          height = parseInt(svgHeight) || height;
        }
      }

      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }

      // 设置高分辨率
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // 设置白色背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 缩放上下文
      ctx.scale(scale, scale);

      // 创建修复后的SVG字符串
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      
      // 创建图片对象
      const img = new Image();
      
      // 使用data URL而不是blob URL来避免跨域问题
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

      img.onload = () => {
        try {
          // 绘制图片到canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // 转换为PNG并下载
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mermaid-diagram.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } else {
              throw new Error('无法创建PNG blob');
            }
          }, 'image/png', 1.0);
          
        } catch (drawError) {
          console.error('绘制到Canvas失败:', drawError);
          throw drawError;
        }
      };

      img.onerror = (error) => {
        console.error('图片加载失败:', error);
        throw new Error('SVG图片加载失败，可能包含不支持的元素');
      };

      // 设置跨域属性
      img.crossOrigin = 'anonymous';
      img.src = svgDataUrl;
      
    } catch (error) {
      console.error('PNG下载失败:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      
      // 尝试备用方案：直接使用SVG元素截图
      try {
        console.log('尝试备用PNG下载方案...');
        await downloadPngFallback();
      } catch (fallbackError) {
        console.error('备用方案也失败了:', fallbackError);
        alert(`PNG下载失败: ${errorMsg}\n\n请尝试使用SVG下载功能。`);
      }
    }
  };

  // 备用PNG下载方案
  const downloadPngFallback = async () => {
    if (!selectedSvg) return;
    
    // 创建一个临时的div来渲染SVG
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.background = 'white';
    tempDiv.innerHTML = selectedSvg;
    
    document.body.appendChild(tempDiv);
    
    try {
      const svgElement = tempDiv.querySelector('svg');
      if (!svgElement) throw new Error('找不到SVG元素');
      
      // 获取SVG尺寸
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 600;
      
      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('无法创建Canvas');
      
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
      
      // 白色背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // 使用foreignObject包装SVG
      const foreignObjectSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="background: white;">
              ${selectedSvg}
            </div>
          </foreignObject>
        </svg>
      `;
      
      const img = new Image();
      const svgBlob = new Blob([foreignObjectSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'mermaid-diagram.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error('备用方案图片加载失败');
      };
      
      img.src = url;
      
    } finally {
      document.body.removeChild(tempDiv);
    }
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
                <div className="flex space-x-2">
                  <button
                    onClick={downloadSvg}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white transition-colors text-sm font-medium"
                  >
                    下载 SVG
                  </button>
                  <button
                    onClick={downloadPng}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors text-sm font-medium"
                  >
                    下载 PNG
                  </button>
                </div>
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
