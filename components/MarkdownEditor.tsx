
import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 px-2 text-slate-400">Markdown Input</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-slate-200 resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono text-sm leading-6"
        placeholder="Type your markdown here..."
        spellCheck="false"
      />
    </div>
  );
};
