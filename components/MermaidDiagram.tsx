import React, { useState, useEffect, useMemo } from 'react';
// Fix: Import Gemini service and icons for improved UI feedback.
import { fixMermaidCode } from '../services/geminiService';
import { MagicIcon } from './icons/MagicIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

declare global {
    interface Window {
        mermaid: any;
    }
}

interface MermaidDiagramProps {
  code: string;
  onImageClick: (svg: string) => void;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, onImageClick }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // Fix: Add state to track AI fixing process.
  const [isFixing, setIsFixing] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | null>(null);

  const diagramId = useMemo(() => `mermaid-diagram-${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
  }, []);
  
  // Fix: Reworked the rendering logic to call the Gemini API on syntax error.
  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async (diagramCode: string) => {
      if (!isMounted || !diagramCode) return;
      
      try {
        await window.mermaid.parse(diagramCode);
        const { svg: renderedSvg } = await window.mermaid.render(diagramId, diagramCode);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
          setFixedCode(null);
        }
      } catch (e) {
        if (isMounted) {
          setError('Mermaid syntax error.');
          setIsFixing(true);
          try {
            const correctedCode = await fixMermaidCode(diagramCode);
            if (isMounted && diagramCode === code) {
              await window.mermaid.parse(correctedCode);
              const { svg: fixedSvg } = await window.mermaid.render(diagramId, correctedCode);
              if (isMounted) {
                setSvg(fixedSvg);
                setError('AI successfully fixed the diagram!');
                setFixedCode(correctedCode);
              }
            }
          } catch (fixError) {
            if (isMounted) {
              setError('AI fix failed. Please check Mermaid syntax.');
            }
          } finally {
            if (isMounted) {
              setIsFixing(false);
            }
          }
        }
      }
    };

    setSvg('');
    setError(null);
    setIsFixing(false);
    setFixedCode(null);
    renderDiagram(code);

    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  // Fix: Add UI state for when the AI is attempting to fix the code.
  if (isFixing) {
    return (
       <div className="bg-slate-900/50 border border-dashed border-cyan-600 rounded-md p-4 my-4 flex flex-col items-center justify-center min-h-[150px]">
           <div className="flex items-center text-cyan-400">
               <SpinnerIcon className="w-5 h-5 mr-2" />
               <p className="font-semibold">Detected syntax error, attempting AI fix...</p>
           </div>
           <pre className="mt-4 text-xs bg-slate-800 p-2 rounded w-full overflow-x-auto text-left">{code}</pre>
       </div>
    );
  }

  // Fix: Add a more informative error message when the AI fix fails.
  if (error && !svg) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-red-700 rounded-md p-4 my-4 flex flex-col items-center justify-center text-center text-red-400 min-h-[150px]">
        <div className="flex items-center font-semibold">
            <MagicIcon className="w-5 h-5 mr-2" />
            <p>{error}</p>
        </div>
        <p className="text-sm text-slate-400 mt-2">The AI couldn't fix this diagram. Please review the code manually.</p>
        <pre className="mt-4 text-xs bg-slate-800 p-2 rounded w-full overflow-x-auto text-left">{code}</pre>
      </div>
    );
  }

  if (!svg) {
     return (
        <div className="bg-slate-900/50 border border-dashed border-slate-600 rounded-md p-4 my-4 flex items-center justify-center min-h-[150px]">
            <SpinnerIcon className="w-6 h-6 text-slate-400" />
            <p className="ml-2 text-slate-400">Rendering diagram...</p>
        </div>
     );
  }

  return (
    <div className="relative my-4">
      {/* Fix: Add a success message when the AI successfully fixes the diagram. */}
      {error && fixedCode && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-900/80 backdrop-blur-sm text-green-300 text-xs px-3 py-1 rounded-full border border-green-700 z-10">
          {error}
        </div>
      )}
      <div 
          className="flex justify-center cursor-pointer hover:bg-slate-700/50 rounded-md transition-colors p-2"
          onClick={() => onImageClick(svg)}
          dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
};
