import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { cn } from '@shared/lib/utils';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onPaste?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
  className?: string;
  classNameInput?: string;
  id?: string;
}

export default function SearchInput({
  value,
  onChange,
  onPaste,
  placeholder = 'Поиск...',
  disabled,
  delay = 500,
  className,
  id,
  classNameInput,
}: Props) {
  const [inner, setInner] = useState(value);
  const debounced = useDebouncedValue(inner, delay);

  useEffect(() => {
    onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setInner(value);
  }, [value]);

  return (
    <div className={cn('relative min-w-0 w-full', className)}>
      <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
      <Input
        id={id}
        value={inner}
        onChange={(e) => setInner(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          onPaste?.(e.clipboardData.getData('text'));
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('w-full min-w-0 pl-9 pr-8', classNameInput)}
      />
      <AnimatePresence>
        {inner.length > 0 && (
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mr-0.5"
              disabled={disabled}
              onClick={() => setInner('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
