import { useEffect, useState } from 'react';
import { RegisterSettingRenderers, SettingsDialog } from '@features/Settings';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsDialogQuery } from '@features/Settings/model/hooks';
import { Button } from '@shared/components/ui/button';
import { Settings } from 'lucide-react';
import { SuperellipseIcon } from '@mrdn/app-common';
import { Skeleton } from '@shared/components/ui/skeleton';
import { PowerSavingBridge } from '@shared/processes/power-saving/ui/PowerSavingBridge';

// 1) Боковое меню опциональное через константу (потенциально функция)
const SHOW_SIDEBAR = true; // переключатель боковой панели
const isSidebarEnabled = () => SHOW_SIDEBAR; // в будущем можно заменить на реальную логику

// Тип данных для сайдбара
type SidebarData = {
  title: string;
  description: string;
  imageUrl?: string | null;
};

export function AuthShell({ children }: { children?: React.ReactNode }) {
  const { openDialog } = useSettingsDialogQuery();

  // 3) Имитация загрузки данных для боковой панели
  const [loading, setLoading] = useState<boolean>(isSidebarEnabled());
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    if (!isSidebarEnabled()) return;

    const timer = setTimeout(() => {
      setLoading(true);
      // Здесь как будто пришли данные извне
      setData({
        title: 'Добро пожаловать в L3',
        description:
          'Войдите, чтобы продолжить работу. Тут можем показывать что-то полезное...',
        imageUrl:
          'https://prod.protech.mrdn.cloud/core/assets/theme/banner/bg.svg', // подставьте URL при наличии
      });
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Анимационные варианты для карточек (2)
  const leftVariants = {
    initial: { x: -40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  const rightVariants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 40, opacity: 0 },
  };

  return (
    <>
      <div className="relative w-full auth-shell min-h-dvh bg-linear-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-950">
        <div className="flex flex-col items-center justify-center w-full h-screen px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div
            className={
              'grid items-stretch gap-8 py-8 sm:py-12 grid-rows-[min-content] w-full ' +
              (isSidebarEnabled()
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1')
            }
          >
            <AnimatePresence>
              <motion.div
                key="auth-card"
                variants={rightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex justify-center"
              >
                <div className="w-full max-w-xs p-4 shadow-none auth-card sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg rounded-2xl bg-white/90 dark:bg-neutral-900/80 backdrop-blur ring-1 ring-black/5 dark:ring-white/10 sm:p-6 md:p-8">
                  {/* Скролл внутри карточки, если экран низкий (ландшафт на мобилках) */}
                  <div className="max-h-[90svh] overflow-auto overscroll-contain">
                    {children ?? <Outlet />}
                  </div>
                </div>
              </motion.div>
              {!isSidebarEnabled() && (
                <div className="absolute w-full top-4 right-4">
                  <Button
                    onClick={() => {
                      openDialog('general');
                    }}
                    className="-mt-6"
                    variant={'outline'}
                    size="sm"
                  >
                    <Settings />
                    Настройки
                  </Button>
                </div>
              )}
            </AnimatePresence>

            {isSidebarEnabled() && (
              <AnimatePresence>
                <motion.aside
                  key="auth-sidebar"
                  variants={leftVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="hidden lg:block"
                >
                  {/* 4) Место под логотип приложения */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="">
                      <SuperellipseIcon
                        size={40}
                        bgClassName="text-white"
                        strokeWidth={1}
                        strokeColor="var(--border)"
                        padding={8}
                      >
                        <img
                          src="/src/assets/logos/ME_logo_icon.svg"
                          alt="L2"
                        />
                      </SuperellipseIcon>
                    </div>
                    <img
                      src="/src/assets/logos/ME_logo_text.svg"
                      alt="L2"
                      className="h-6 dark:invert"
                    />
                  </div>
                  {/* 5) Скелетон при загрузке */}
                  {loading ? (
                    <div className="animate-pulse">
                      <Skeleton className="w-64 h-6 mb-3 rounded-2xl bg-black/10 dark:bg-white/10" />
                      <Skeleton className="h-4 mb-1 rounded-2xl bg-black/10 dark:bg-white/10 w-80" />
                      <Skeleton className="h-4 mb-6 rounded-2xl bg-black/10 dark:bg-white/10 w-72" />
                      <Skeleton className="h-64 bg-black/10 dark:bg-white/10 rounded-2xl" />
                    </div>
                  ) : (
                    data && (
                      <div className="flex flex-col gap-6">
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                          {data.title}
                        </h1>
                        <p className="max-w-md text-muted-foreground">
                          {data.description}
                        </p>
                        {data.imageUrl ? (
                          <img
                            src={data.imageUrl}
                            alt="Auth illustration"
                            className="object-cover w-full h-64 mt-2 bg-gray-300 border rounded-2xl dark:bg-neutral-800"
                          />
                        ) : (
                          <div className="h-64 mt-2 shadow-inner rounded-2xl bg-white/60 dark:bg-neutral-800/50" />
                        )}
                      </div>
                    )
                  )}
                  <Button
                    onClick={() => {
                      openDialog('general');
                    }}
                    className="mt-6"
                    size="sm"
                    variant={'outline'}
                  >
                    <Settings />
                    Настройки
                  </Button>
                </motion.aside>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <SettingsDialog />
      <RegisterSettingRenderers />
      <PowerSavingBridge />
    </>
  );
}
