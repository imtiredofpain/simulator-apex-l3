import * as React from 'react';
// import { useTranslation } from 'react-i18next';
import { rendererRegistry } from '@features/Settings/model/registry';
import { useSetting } from '../../model/hooks';

interface Props {
  id: string;
  i18nKey: string;
  rendererKey: string;
  meta?: Record<string, unknown>;
  description?: string;
}

export const CustomControl: React.FC<Props> = React.memo(
  ({ id, i18nKey, rendererKey, meta, description }) => {
    // const { t } = useTranslation();
    const { value, set, status } = useSetting<unknown>(id);

    const Renderer = rendererRegistry.get<unknown, Record<string, unknown>>(
      rendererKey
    );

    if (!Renderer) return null;

    return (
      <div className="flex flex-col gap-3 py-2 space-y-2">
        {/* <Label htmlFor={id}>{t("settings." + i18nKey)}</Label> */}
        <Renderer
          id={id}
          value={value}
          meta={meta}
          disabled={status === 'loading'}
          onChange={(v) => void set(v, { optimistic: true })}
          i18nKey={i18nKey}
          description={description}
        />
      </div>
    );
  }
);
CustomControl.displayName = 'CustomControl';
