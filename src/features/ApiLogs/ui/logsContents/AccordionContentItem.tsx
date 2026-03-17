import { useTheme } from '@features/Settings/providers/theme';
import { Button } from '@shared/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert, Copy } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark, lightfair } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from 'sonner';

const parseJsonSafe = (str: string | undefined) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e: unknown) {
    console.error(e);
    return null;
  }
};

const handleCopyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Текст скопирован в буфер обмена');
    return true;
  } catch (e: unknown) {
    if (e instanceof Error) {
      toast.error('Не удалось скопировать текст в буфер обмена', {
        description: e.message,
      });
    } else if (e instanceof DOMException) {
      toast.error('Не удалось скопировать текст в буфер обмена', {
        description: e.message,
      });
    } else {
      toast.error('Не удалось скопировать текст в буфер обмена');
    }
  }

  return false;
};

function AccortionContentItem({
  name,
  data,
  copyToClipboard = handleCopyToClipboard,
  isJson = true,
}: {
  name: string;
  data: string | undefined;
  copyToClipboard?: (text: string) => void | Promise<boolean>;
  isJson?: boolean;
}) {
  const [copied, setCopied] = useState<boolean | null>(null);
  const { theme } = useTheme();
  const highlighterStyle = theme === 'dark' ? dark : lightfair;
  const dataParse = isJson ? parseJsonSafe(data) : data;

  useEffect(() => {
    if (typeof copied == 'boolean') {
      const tmr = setTimeout(() => {
        setCopied(null);
      }, 3000);

      return () => clearTimeout(tmr);
    }
  }, [copied]);

  if (!dataParse)
    return (
      <div className="bg-accent p-2 rounded overflow-auto max-h-96 whitespace-pre-wrap wrap-break-word">
        Нет данных
      </div>
    );
  return (
    <div>
      <h4 className="font-semibold flex items-center justify-between mb-2">
        {name}
        <Button
          variant="outline"
          size="xs"
          onClick={async () => {
            if (copied) return;
            const res = await copyToClipboard(data || '');
            if (typeof res === 'boolean') {
              setCopied(res);
            }
          }}
          disabled={typeof copied == 'boolean'}
          className="gap-2 disabled:opacity-100 disabled:cursor-default"
        >
          <AnimatePresence mode="wait">
            {copied === null && (
              <motion.div
                className="flex flex-row gap-2 items-center overflow-hidden"
                initial={{
                  width: 0,
                  opacity: 0,
                }}
                animate={{
                  width: 94,
                  opacity: 1,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                }}
              >
                <Copy className="h-3.5! w-3.5!" size={14} />
                <div>Копировать</div>
              </motion.div>
            )}
            {copied === true && (
              <motion.div
                className="flex flex-row gap-2 items-center  overflow-hidden"
                initial={{
                  width: 0,
                  opacity: 0,
                }}
                animate={{
                  width: 105,
                  opacity: 1,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                }}
              >
                <Check className="h-3.5! w-3.5! text-emerald-500" size={14} />
                <div>Скопировано</div>
              </motion.div>
            )}
            {copied === false && (
              <motion.div
                className="flex flex-row gap-2 items-center  overflow-hidden"
                initial={{
                  width: 0,
                  opacity: 0,
                }}
                animate={{
                  width: 174,
                  opacity: 1,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                }}
              >
                <CircleAlert className="h-3.5! w-3.5! text-red-500" size={14} />
                <div>Не удалось скопировать!</div>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </h4>
      <pre className="bg-accent p-2 rounded-md overflow-auto max-h-96 border border-input">
        <SyntaxHighlighter
          language={isJson ? 'json' : ''}
          style={highlighterStyle}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{ background: 'transparent' }}
        >
          {isJson ? JSON.stringify(dataParse, null, 2) : dataParse}
        </SyntaxHighlighter>
      </pre>
    </div>
  );
}

export default memo(AccortionContentItem);
