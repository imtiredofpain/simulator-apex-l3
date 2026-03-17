import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@features/Settings/providers/theme';
import { useSetting } from '../../model/hooks';
import type { ThemeValue } from '@features/Settings/model/types';
import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { Label } from '@shared/components/ui/label';
import { Button } from '@shared/components/ui/button';
import LightImage from '@assets/light.svg';
import DarkImage from '@assets/dark.svg';
import AutoImage from '@assets/auto.svg';

interface Option {
  labelKey: string;
  value: ThemeValue;
  descriptionKey: string;
  image: string;
}

const OPTIONS: ReadonlyArray<Option> = [
  {
    labelKey: 'appearance.theme.light',
    value: 'light',
    descriptionKey: 'appearance.theme.lightDesc',
    image: LightImage,
  },
  {
    labelKey: 'appearance.theme.dark',
    value: 'dark',
    descriptionKey: 'appearance.theme.darkDesc',
    image: DarkImage,
  },
  {
    labelKey: 'appearance.theme.system',
    value: 'system',
    descriptionKey: 'appearance.theme.systemDesc',
    image: AutoImage,
  },
];

export const ThemeControl: React.FC<{ id: string; i18nKey: string }> =
  React.memo(({ id, i18nKey }) => {
    const { t } = useTranslation();
    const { setTheme, theme } = useTheme();
    const { set } = useSetting<ThemeValue>(id);

    const current = (theme as ThemeValue) ?? 'system';

    const handle = React.useCallback(
      async (v: ThemeValue) => {
        setTheme(v);
        await set(v, { optimistic: true });
      },
      [setTheme, set]
    );

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2">
          <Label>{t('settings.' + i18nKey)}</Label>
        </div>
        <div className="grid w-full grid-cols-3 gap-3">
          {OPTIONS.map((o) => {
            const isActive = current === o.value;
            return (
              <Button
                key={o.value}
                variant="ghost"
                onClick={() => void handle(o.value)}
                className={clsx(
                  'border flex flex-col items-start h-auto p-0 gap-0 overflow-hidden'
                )}
              >
                <div className="relative w-full text-xs whitespace-normal h-22 text-muted-foreground">
                  <div className="relative w-full h-full p-2 overflow-hidden bg-muted dark:bg-muted-foreground z-2">
                    <div
                      className="absolute w-full h-full bg-cover left-3 top-3 z-2 background-position-left"
                      style={{
                        backgroundImage: `url(${o.image})`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center w-full gap-2 p-2 px-3 text-sm border-t">
                  {isActive && (
                    <CheckCircle2 className="text-green-600" size={16} />
                  )}
                  <span>{t('settings.' + o.labelKey)}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    );
  });
ThemeControl.displayName = 'ThemeControl';
