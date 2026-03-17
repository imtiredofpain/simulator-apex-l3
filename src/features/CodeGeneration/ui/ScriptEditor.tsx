import Editor, { type OnMount } from '@monaco-editor/react';
import { useCallback, useRef } from 'react';
import { useTheme } from '@features/Settings/providers/theme';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  language?: string;
}

export function ScriptEditor({
  value,
  onChange,
  height = '400px',
  readOnly = false,
  language = 'csharp',
}: ScriptEditorProps) {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          readOnly,
          wordWrap: 'on',
          padding: { top: 8 },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Загрузка редактора...
          </div>
        }
      />
    </div>
  );
}
