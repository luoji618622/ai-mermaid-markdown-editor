import React, { useMemo } from 'react';
import { MermaidDiagram } from './MermaidDiagram';

declare global {
  interface Window {
    marked: {
      parse(markdown: string): string;
    };
  }
}

interface MarkdownPreviewProps {
  markdown: string;
  onImageClick: (svg: string) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, onImageClick }) => {
  const contentParts = useMemo(() => {
    if (!markdown) return [];
    
    const parts = markdown.split(/(```mermaid\n[\s\S]*?\n```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```mermaid')) {
        const code = part.replace(/```mermaid\n|```/g, '').trim();
        return (
          <MermaidDiagram
            key={index}
            code={code}
            onImageClick={onImageClick}
          />
        );
      } else {
        return (
          <div
            key={index}
            className="prose prose-invert prose-slate max-w-none prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700"
            dangerouslySetInnerHTML={{ __html: window.marked.parse(part) }}
          />
        );
      }
    });
  }, [markdown, onImageClick]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 px-2 text-slate-400">Live Preview</h2>
      <div className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-md p-4 overflow-y-auto">
        {contentParts}
      </div>
    </div>
  );
};