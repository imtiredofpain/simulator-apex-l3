import { useTranslation } from 'react-i18next';
import { settingsTree } from '@features/Settings/config';
import { splitPath } from '@features/Settings/lib/tree';
import {
  SwitchControl,
  CheckboxControl,
  SelectControl,
  ThemeControl,
  CustomControl,
} from '@features/Settings/ui';
import { ScrollArea } from '@shared/components/ui/scroll-area';
import { Separator } from '@shared/components/ui/separator';
import { useSettingsStore } from '@features/Settings/model/store';
import { getSectionRenderer } from '@features/Settings/registry/section';
import type { SettingsGroup } from '@features/Settings/model/types';
import { useEffect, useRef, useState } from 'react';

export const SettingsContent: React.FC<{ currentPath: string }> = ({
  currentPath,
}) => {
  const { t } = useTranslation();
  const [top] = splitPath(currentPath);
  const group = (settingsTree.groups as Record<string, SettingsGroup>)[top];
  const focusId = useSettingsStore((s) => s.focusId);
  const setFocus = useSettingsStore((s) => s.setFocus);

  // refs по настройкам
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // подсветка
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!focusId) return;
    const el = itemRefs.current[focusId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightId(focusId);
      const tmr = setTimeout(() => setHighlightId(undefined), 1500);
      const tmr2 = setTimeout(() => setFocus(undefined), 1600);
      return () => {
        clearTimeout(tmr);
        clearTimeout(tmr2);
      };
    } else {
      // если элемент ещё не в DOM (переключение секции), подождём один тик
      const tmr = setTimeout(() => setFocus(focusId), 100);
      return () => clearTimeout(tmr);
    }
  }, [focusId, setFocus]);

  if (!group) return null;

  const wrap = (id: string, node: React.ReactNode) => (
    <div
      key={id}
      ref={(el) => {
        itemRefs.current[id] = el;
      }}
      data-setting-id={id}
      className={
        highlightId === id
          ? 'rounded-md ring-2 ring-primary/40 p-1 -m-1 transition'
          : undefined
      }
    >
      {node}
    </div>
  );

  const CustomSection = getSectionRenderer(group.renderer);
  if (CustomSection) {
    return (
      <ScrollArea className="w-full h-full max-h-[550px]">
        <div className="p-4">
          <CustomSection
            group={group}
            path={currentPath}
            t={t}
            setFocus={(id, force) =>
              useSettingsStore.getState().setFocus(id, force)
            }
          />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="w-full h-full max-h-[550px]">
      <div className="flex flex-col pt-4 pb-4 gap-7">
        {group.groups
          ? Object.values(group.groups).map((sub, idx, arr) => (
              <div key={sub.id} className="px-4 space-y-3">
                <h5 className="flex items-center gap-2 text-sm font-semibold">
                  {sub.icon ? (
                    <sub.icon size={18} className="shrink-0" />
                  ) : null}
                  {t('settings.' + sub.i18nKey)}
                </h5>
                <div className="space-y-2">
                  {sub.items?.map((s) => {
                    switch (s.type) {
                      case 'switch':
                        return wrap(
                          s.id,
                          <SwitchControl
                            key={s.id}
                            id={s.id}
                            i18nKey={s.i18nKey}
                            description={s.description}
                          />
                        );
                      case 'checkbox':
                        return wrap(
                          s.id,
                          <CheckboxControl
                            key={s.id}
                            id={s.id}
                            i18nKey={s.i18nKey}
                            options={s.options}
                            description={s.description}
                          />
                        );
                      case 'select':
                        return wrap(
                          s.id,
                          <SelectControl
                            key={s.id}
                            id={s.id}
                            i18nKey={s.i18nKey}
                            options={s.options}
                            description={s.description}
                          />
                        );
                      case 'theme':
                        return wrap(
                          s.id,
                          <ThemeControl
                            key={s.id}
                            id={s.id}
                            i18nKey={s.i18nKey}
                          />
                        );
                      case 'custom':
                        return wrap(
                          s.id,
                          <CustomControl
                            key={s.id}
                            id={s.id}
                            i18nKey={s.i18nKey}
                            rendererKey={s.renderer}
                            meta={s.meta}
                            description={s.description}
                          />
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
                {idx < (arr?.length ?? 1) - 1 && <Separator className="mt-7" />}
              </div>
            ))
          : null}
      </div>
    </ScrollArea>
  );
};
