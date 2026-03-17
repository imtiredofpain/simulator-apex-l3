import { Spin } from '@mrdn/app-common';
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LoadStep } from '../types';
import { motion } from 'framer-motion';

const LoadingStepsPanel = memo(function LoadingStepsPanel({
  steps,
  currentIndex,
}: {
  steps: LoadStep[];
  currentIndex: number;
}) {
  const GAP = 8; // px — соответствует Tailwind space-y-2

  const ulRef = useRef<HTMLUListElement | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const [prefix, setPrefix] = useState<number[]>([]);

  // Перемеряем каждый раз, когда меняется список или его содержимое (статус/текст)
  useLayoutEffect(() => {
    if (!ulRef.current) return;
    const nodes = Array.from(ulRef.current.children) as HTMLElement[];
    const hs = nodes.map((el) => el.offsetHeight || 0);
    setHeights(hs);
    const pref: number[] = new Array(hs.length + 1).fill(0);
    for (let i = 0; i < hs.length; i++) pref[i + 1] = pref[i] + hs[i] + GAP; // учитываем промежутки
    setPrefix(pref);
  }, [steps]);

  // Стартовый индекс окна (previous/current/next)
  const maxStart = Math.max(0, steps.length - 3);
  const startIndex = Math.min(Math.max(0, currentIndex - 1), maxStart);

  // Высота видимого окна = сумма высот prev/current/next + 2 * GAP
  const visibleHeight = useMemo(() => {
    if (heights.length === 0) return 0;
    const i0 = startIndex;
    const i1 = Math.min(startIndex + 1, heights.length - 1);
    const i2 = Math.min(startIndex + 2, heights.length - 1);
    const i3 = Math.min(startIndex + 3, heights.length - 1);
    return (
      (heights[i0] || 0) +
      (heights[i1] || 0) +
      (heights[i2] || 0) +
      (heights[i3] || 0) +
      2 * GAP +
      GAP
    );
  }, [heights, startIndex]);

  // Смещение списка по Y = сумма высот элементов до startIndex
  const translateY = useMemo(() => {
    if (prefix.length === 0) return 0;
    return prefix[startIndex] || 0;
  }, [prefix, startIndex]);

  const progress: {
    percent: number;
    count: number;
    active: number;
  } = useMemo(() => {
    const count = steps.length;
    return {
      percent: ((currentIndex + 1) / count) * 100,
      count,
      active: currentIndex + 1,
    };
  }, [currentIndex, steps.length]);

  const preventScroll = useCallback(
    (e: React.UIEvent | React.WheelEvent | React.TouchEvent) => {
      e.preventDefault?.();
      e.stopPropagation?.();
      return false;
    },
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex gap-3 p-3 mt-6 -m-6 select-none rounded-xl bg-card/40 dark:bg-neutral-900/60"
    >
      {/* Левая иконка/спиннер */}
      <div className="flex items-start justify-center flex-none pt-0 bg-transparent rounded-lg">
        <Spin size={24} width={4.4} />
      </div>
      <div className="flex-1 min-w-0">
        {/* Заголовок блока */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            Идёт подготовка рабочего окружения…
          </p>
          <h3 className="text-lg font-medium truncate">
            {steps[currentIndex]?.title || 'Загрузка…'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {steps[currentIndex]?.description}
          </p>
        </div>

        {/* Окно прокрутки — только для списка */}
        <div
          className="overflow-hidden"
          style={{ height: visibleHeight ? `${visibleHeight}px` : undefined }}
          onWheel={preventScroll as any}
          onTouchMove={preventScroll as any}
          onScroll={preventScroll as any}
        >
          <motion.ul
            ref={ulRef}
            className="space-y-2"
            animate={{ y: -translateY }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            {steps.map((s) => (
              <li key={s.key} className="flex items-start gap-3">
                <div
                  className={
                    'mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ' +
                    (s.status === 'done'
                      ? 'bg-emerald-500'
                      : s.status === 'running'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-gray-300 dark:bg-neutral-700')
                  }
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.description}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto text-xs text-muted-foreground">
                  {s.status === 'done' && 'готово'}
                  {s.status === 'running' && 'в процессе'}
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
      <div className="absolute left-0 right-0 w-full h-2 rounded-sm bg-muted -bottom-14 ">
        <motion.div
          className="h-full rounded-sm bg-foreground/25"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
        <div className="absolute text-xs text-center text-[11px] font-bold transform translate-y-[calc(100%+6px)] bottom-0 flex items-center justify-center gap-2">
          <div>
            {progress.active}/{progress.count}
          </div>
          <div className="font-medium text-muted-foreground">
            {progress.percent.toFixed(0)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default LoadingStepsPanel;
