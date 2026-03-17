import React, { useEffect, useState, useRef } from "react";
import { Spin } from "@mrdn/app-common";
import clsx from "clsx";
import { TriangleAlert } from "lucide-react";

type ExternalIframeProps = {
  /** Обязательная ссылка на сайт */
  src: string;
  /** title для iframe (для a11y) */
  title?: string;
  /** Кастомные классы для контейнера */
  className?: string;
  /** Картинка 1920x1080, которую хотим показывать в области iframe */
  previewImageSrc?: string;
  /** Текст под спиннером */
  loadingText?: string;
};

export const ExternalIframe: React.FC<ExternalIframeProps> = ({
  src,
  title = "Embedded page",
  className,
  previewImageSrc,
  loadingText = "Загружаем страницу…",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    // Небольшой preflight, чтобы поймать сетевые/HTTP-ошибки до рендера iframe
    (async () => {
      try {
        const res = await fetch(src, { method: "HEAD" });

        if (!cancelled) {
          // Разрешаем 2xx и 3xx (редиректы), считаем ошибкой только 4xx/5xx
          if (res.status >= 400) {
            setError(
              `Сервер вернул статус ${res.status} ${res.statusText || ""}`.trim()
            );
            setLoading(false);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "Неизвестная ошибка сети";
          setError(`Не удалось загрузить ресурс: ${message}`);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const handleLoad = () => {
    // onLoad срабатывает даже при 4xx/5xx, поэтому если уже есть error — не чистим его
    if (!error) {
      setLoading(false);
    }

    // Пытаемся принудительно сделать область контента внутри iframe 1920x1080
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;

    try {
      const doc =
        iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (!doc) return;

      const root = doc.documentElement;
      const body = doc.body;

      if (root) {
        root.style.width = "1920px";
        root.style.height = "1080px";
        root.style.margin = "0";
      }

      if (body) {
        body.style.width = "1920px";
        body.style.height = "1080px";
        body.style.margin = "0";
      }
    } catch {
      // Если по каким-то причинам не можем залезть в iframe (хотя в Electron с webSecurity=false это маловероятно),
      // просто игнорируем ошибку.
    }
  };

  const handleError = () => {
    setError("Браузер не смог отобразить страницу в iframe.");
    setLoading(false);
  };

  const showIframe = !error;

  const scale = 5;

  return (
    <div
      className={clsx("relative w-full", className)}
      // style={{ aspectRatio: "16 / 9" }} // 1920x1080
    >
      {showIframe && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: `calc(100% * ${scale} + var(--spacing) * ${scale * 3})`,
            height: `calc(200px * ${scale})`,
            transform: `scale(${(100 / scale) * 0.01})`,
            marginBottom: `calc(-200px * ${scale})`,
            borderRadius: `calc(var(--radius) * ${scale / 2.3})`,
          }}
          className={`origin-top-left border-0 overflow-hidden`}
          allow="fullscreen; clipboard-read; clipboard-write"
        />
      )}

      {/* Картинка 1920x1080 в области iframe */}
      {previewImageSrc && !error && (
        <img
          src={previewImageSrc}
          width={1920}
          height={1080}
          className="absolute inset-0 object-contain w-full h-full pointer-events-none"
          style={{
            opacity: loading ? 1 : 0,
            transition: "opacity 200ms ease-out",
          }}
          alt=""
        />
      )}

      {/* Слой загрузки поверх iframe */}
      {loading && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-sm pointer-events-none bg-black/5 backdrop-blur-sm"
          style={{
            width: `calc(100% + var(--spacing) * 3)`,
          }}
        >
          <Spin size={16} width={3} />
          <span className="text-xs text-gray-500">{loadingText}</span>
        </div>
      )}

      {/* Слой ошибки (iframe прячем, тут уже всё наше) */}
      {error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center rounded-sm pointer-events-none bg-black/5 backdrop-blur-sm"
          style={{
            width: `calc(100% + var(--spacing) * 3)`,
          }}
        >
          {previewImageSrc && (
            <img
              src={previewImageSrc}
              width={1920}
              height={1080}
              className="object-contain max-w-full rounded-md shadow-md max-h-60"
              alt="Предпросмотр"
            />
          )}
          <TriangleAlert className="text-red-500 h-7! w-7!" size={30} />
          <div>
            <div className="font-semibold">Не удалось открыть ссылку</div>
            <div className="text-xs opacity-80">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};
