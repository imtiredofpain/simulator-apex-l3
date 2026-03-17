import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetting } from '../../model/hooks';
import type { SelectOption } from '@features/Settings/model/types';
import { Label } from '@shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';

interface Props {
  id: string;
  i18nKey: string;
  options: ReadonlyArray<SelectOption>;
  description?: string;
}

export const SelectControl: React.FC<Props> = React.memo(
  ({ id, i18nKey, options, description }) => {
    const { t } = useTranslation();
    const { value, set, status } = useSetting<string>(id);

    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <Label
          htmlFor={id}
          className="flex flex-col items-start text-left align-start"
        >
          <div>{t('settings.' + i18nKey)}</div>
          {!!description && (
            <div className="mt-1 text-xs font-light text-muted-foreground">
              {description}
            </div>
          )}
        </Label>
        <Select
          value={String(value)}
          onValueChange={(v) => void set(v, { optimistic: true })}
          disabled={status === 'loading'}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t('settings.' + o.i18nKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);
SelectControl.displayName = 'SelectControl';
