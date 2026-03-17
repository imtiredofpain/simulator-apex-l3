'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@features/Settings/model/store';
import { Input } from '@shared/components/ui/input';

export const SettingsSearch: React.FC = () => {
  const { t } = useTranslation();
  const search = useSettingsStore((s) => s.search);
  const setSearch = useSettingsStore((s) => s.setSearch);

  return (
    <div className="p-3 pb-0">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('settings.search.placeholder')}
        type="search"
      />
    </div>
  );
};
