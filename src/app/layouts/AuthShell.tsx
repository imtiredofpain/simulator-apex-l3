import { useEffect, useState } from "react";
import { RegisterSettingRenderers, SettingsDialog } from "@features/Settings";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsDialogQuery } from "@features/Settings/model/hooks";
import { Button } from "@shared/components/ui/button";
import { Settings } from "lucide-react";
import { Skeleton } from "@shared/components/ui/skeleton";
import { PowerSavingBridge } from "@shared/processes/power-saving/ui/PowerSavingBridge";
import ApexLogo from "@assets/logos/apex_logo_inline.svg";

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
        title: "Добро пожаловать в L3",
        description:
          "Войдите, чтобы продолжить работу. Тут можем показывать что-то полезное...",
        imageUrl:
          "https://prod.protech.mrdn.cloud/core/assets/theme/banner/bg.svg", // подставьте URL при наличии
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
      <div className="control-surface auth-shell relative min-h-dvh w-full overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-48 size-[560px] rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-64 -right-40 size-[620px] rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="flex flex-col items-center justify-center w-full h-screen px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div
            className={
              "grid items-stretch gap-8 py-8 sm:py-12 grid-rows-[min-content] w-full " +
              (isSidebarEnabled()
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1")
            }
          >
            <AnimatePresence>
              <motion.div
                key="auth-card"
                variants={rightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <div className="control-panel auth-card relative min-h-[520px] w-full max-w-xs overflow-hidden rounded-2xl border-primary/20 bg-card/80 p-4 sm:max-w-sm sm:p-6 md:max-w-md md:p-8 lg:max-w-md xl:max-w-lg">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-cyan-400" />
                  <div className="absolute right-5 top-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                    Secure node
                  </div>
                  {/* Скролл внутри карточки, если экран низкий (ландшафт на мобилках) */}
                  <div className="max-h-[90svh] overflow-auto overscroll-contain pt-8">
                    {children ?? <Outlet />}
                  </div>
                </div>
              </motion.div>
              {!isSidebarEnabled() && (
                <div className="absolute w-full top-4 right-4">
                  <Button
                    onClick={() => {
                      openDialog("general");
                    }}
                    className="-mt-6"
                    variant={"outline"}
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
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="hidden lg:block"
                >
                  {/* 4) Место под логотип приложения */}
                  <div className="mb-7 flex items-center justify-between gap-3">
                    <img
                      src={ApexLogo}
                      alt="Apex L3"
                      className="h-9 w-auto"
                    />
                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Контур доступен
                    </div>
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
                        <div className="technical-label text-primary">
                          Industrial operations platform
                        </div>
                        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                          {data.title}
                        </h1>
                        <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                          {data.description}
                        </p>
                        {data.imageUrl ? (
                          <div className="group relative mt-1 overflow-hidden rounded-2xl border border-border/70 shadow-2xl">
                            <img
                              src={data.imageUrl}
                              alt="Auth illustration"
                              className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/90 to-transparent p-4 pt-16 text-white">
                              <div>
                                <p className="technical-label text-white/50">Production line</p>
                                <p className="mt-1 text-sm font-semibold">Операционный контур L3</p>
                              </div>
                              <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs backdrop-blur">
                                ONLINE
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 mt-2 shadow-inner rounded-2xl bg-white/60 dark:bg-neutral-800/50" />
                        )}
                      </div>
                    )
                  )}
                  <Button
                    onClick={() => {
                      openDialog("general");
                    }}
                    className="mt-6"
                    size="sm"
                    variant={"outline"}
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
