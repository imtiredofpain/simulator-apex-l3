import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetting } from '../../model/hooks';
import { Label } from '@shared/components/ui/label';
import { Switch } from '@shared/components/ui/switch';

interface Props {
  id: string;
  i18nKey: string;
  description?: string;
}

export const SwitchControl: React.FC<Props> = React.memo(
  ({ id, i18nKey, description }) => {
    const { t } = useTranslation();
    const { value, set, status } = useSetting<boolean>(id);

    const onCheckedChange = React.useCallback(
      async (checked: boolean) => {
        await set(checked, { optimistic: true });
      },
      [set]
    );

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
        <Switch
          id={id}
          checked={!!value}
          onCheckedChange={onCheckedChange}
          disabled={status === 'loading'}
        />
      </div>
    );
  }
);
SwitchControl.displayName = 'SwitchControl';
