'use client';

import { useEffect } from 'react';
import { registerSidebarRenderer } from '@features/Settings/registry/sidebar';
import { registerSectionRenderer } from '@features/Settings/registry/section';
import SidebarProfileCard from '@features/Settings/ui/custom/SidebarProfileCard';
import ProfileSection from '@features/Settings/ui/custom/ProfileSection';
// import SettingsZoomFactor from '@shared/components/Settings/ZoomFactor';
// import { rendererRegistry } from '../../model/registry';

export function RegisterSettingRenderers() {
  useEffect(() => {
    registerSidebarRenderer('profile-card', SidebarProfileCard);
    registerSectionRenderer('profile-section', ProfileSection);
    // registerSectionRenderer('zoom-factor', SettingsZoomFactor);
  }, []);
  return null;
}

// rendererRegistry.register<string, Record<string, unknown>>(
//   'zoom-factor',
//   SettingsZoomFactor
// );
