import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetting } from '../../model/hooks';
import type { SelectOption } from '@features/Settings/model/types';
import { Label } from '@shared/components/ui/label';
import { Checkbox } from '@shared/components/ui/checkbox';

interface Props {
  id: string;
  i18nKey: string;
  options: ReadonlyArray<SelectOption>;
  description?: string;
}

export const CheckboxControl: React.FC<Props> = React.memo(
  ({ id, i18nKey, options, description }) => {
    const { t } = useTranslation();
    const { value, set, status } = useSetting<string[]>(id);

    const selected = React.useMemo(
      () => (Array.isArray(value) ? value : []),
      [value]
    );

    const toggle = React.useCallback(
      async (opt: string, checked: boolean) => {
        const next = checked
          ? [...selected, opt]
          : selected.filter((v) => v !== opt);
        await set(next, { optimistic: true });
      },
      [selected, set]
    );

    return (
      <div className="flex flex-col gap-3 py-2 space-y-2">
        <Label className="flex flex-col items-start text-left align-start">
          <div>{t('settings.' + i18nKey)}</div>
        </Label>
        <div className="space-y-2">
          {options.map((o) => {
            const cid = `${id}-${o.value}`;
            const isChecked = selected.includes(o.value);
            return (
              <div key={o.value} className="flex items-center space-x-2">
                <Checkbox
                  id={cid}
                  checked={isChecked}
                  onCheckedChange={(c) => void toggle(o.value, Boolean(c))}
                  disabled={status === 'loading'}
                />
                <Label htmlFor={cid}>{t('settings.' + o.i18nKey)}</Label>
              </div>
            );
          })}
        </div>

        {!!description && (
          <div className="mt-3 text-xs font-light text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    );
  }
);
CheckboxControl.displayName = 'CheckboxControl';
