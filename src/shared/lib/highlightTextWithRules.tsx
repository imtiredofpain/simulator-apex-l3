import { type JSX } from 'react';
import getStatusColorClass from './getStatusColorClass';
import { toast } from 'sonner';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@shared/components/ui/tooltip';
import { cn } from './utils';
import { ExternalIframe } from '../components/ExternalIframe';
import { Button } from '../components/ui/button';

type HighlightRule = {
  pattern: RegExp;
  render: (match: RegExpExecArray, key: string) => JSX.Element;
};

const handleClickCopy = (
  text: string,
  params: {
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>;
    toasts?: {
      successToast?: {
        label?: string;
        description?: string | React.ReactNode;
      };
      errorToast?: {
        label?: string;
        description?: string | React.ReactNode;
      };
    };
  }
) => {
  const { e, toasts } = params;
  const {
    successToast = {
      label: 'Скопировано!',
      description: (
        <div>
          Значение <b className="font-mono">{text}</b> скопировано в буфер
          обмена.
        </div>
      ),
    },
    errorToast = {
      label: 'Ошибка копирования!',
      description: 'Не удалось скопировать значение в буфер обмена.',
    },
  } = toasts || {};

  e.persist();
  e.nativeEvent.preventDefault();
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
  e.preventDefault();
  e.nativeEvent.stopImmediatePropagation();

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success(successToast.label, {
        icon: (
          <div className="relative">
            <Copy size={16} />
            <Check
              size={14}
              strokeWidth={4}
              className="absolute p-[2px] bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 rounded-full text-emerald-500 bg-background"
            />
          </div>
        ),
        description: successToast.description,
      });
    })
    .catch((err) => {
      console.error('Could not copy text: ', err);
      toast.error(errorToast.label, {
        icon: (
          <div className="relative">
            <Copy size={16} />
            <X
              size={14}
              strokeWidth={4}
              className="absolute p-[2px] bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 rounded-full text-red-500 bg-background"
            />
          </div>
        ),
        description: errorToast.description,
      });
    });
};

export const DEFAULT_LOG_HIGHLIGHT_RULES: readonly HighlightRule[] = [
  {
    // Время формата ISO (2025-11-16T07:07:38.1064160Z), в том числе в кавычках
    // Допускаем от 1 до 7 цифр в дробной части и необязательную дробную часть
    // Примерно: "2025-11-16T07:07:38.1064160Z" или 2025-11-16T07:07:38Z
    pattern: /"?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?Z)"?/g,
    render: (match, key) => {
      const raw = match[0];
      const ts = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');
      const format = new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'longGeneric',
      });
      const dateIsValid = Date.parse(ts);
      const formattedDate = isNaN(dateIsValid)
        ? ts
        : format.format(dateIsValid);

      const display = (
        <>
          {hasLeadingQuote ? '"' : null}
          {formattedDate}
          {hasTrailingQuote ? '"' : null}
        </>
      );

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(ts, {
                  e,
                })
              }
              className="underline cursor-pointer decoration-dotted text-sky-500 hover:decoration-solid"
            >
              {display}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Время формата HH:mm:ss (23:59:00), в т.ч. в кавычках
  {
    pattern: /"?\b((?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d)\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(value, {
                  e,
                })
              }
              className="underline cursor-pointer decoration-dotted text-sky-500"
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Verified | completed | Printed | Rejected | ReadError
  {
    pattern: /"?\b(Verified|completed|Printed|Rejected|ReadError)\b"?/giu,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      const isError = /Rejected|ReadError/giu.test(value);

      return (
        <span
          key={key}
          className={cn(isError ? 'text-red-600' : 'text-green-600')}
        >
          {hasLeadingQuote ? '"' : null}
          {value}
          {hasTrailingQuote ? '"' : null}
        </span>
      );
    },
  },

  // false | true | null (в т.ч. в кавычках)
  {
    pattern: /"?\b(true|false|null)\b"?/giu,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <span key={key} className="text-yellow-600 dark:text-yellow-500">
          {hasLeadingQuote ? '"' : null}
          {value}
          {hasTrailingQuote ? '"' : null}
        </span>
      );
    },
  },

  // uuidv4, uuidv6, uuidv8 (RFC-style, с определением версии), в т.ч. в кавычках
  {
    pattern:
      /"?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[468][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      const versionChar = value.split('-')[2]?.[0]?.toLowerCase() ?? undefined;

      let versionLabel: 'uuid' | 'v4' | 'v6' | 'v8' = 'uuid';
      const colorClass = 'text-fuchsia-600'; // уникальный цвет для всех UUID

      switch (versionChar) {
        case '4':
          versionLabel = 'v4';
          break;
        case '6':
          versionLabel = 'v6';
          break;
        case '8':
          versionLabel = 'v8';
          break;
      }

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(value, {
                  e,
                })
              }
              className={
                'cursor-pointer font-mono text-[11px] underline decoration-dotted hover:decoration-solid ' +
                colorClass
              }
              title={versionLabel === 'uuid' ? 'UUID' : `UUID ${versionLabel}`}
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // IPv4 (в т.ч. в кавычках)
  {
    pattern: /"?\b((?:\d{1,3}\.){3}\d{1,3})\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(value, {
                  e,
                })
              }
              className="underline cursor-pointer decoration-dotted hover:decoration-solid text-sky-500"
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // IPv6 (упрощённый паттерн, в т.ч. в кавычках)
  {
    pattern: /"?\b((?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4})\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(value, {
                  e,
                })
              }
              className="underline cursor-pointer decoration-dotted hover:decoration-solid text-violet-500"
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // Строки формата: 019876543210123421l99002572265193ASDF
  {
    pattern: /"?\b(\d{10,}l\d{8,}(|)\d{2,}[A-Z]{2,})\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(value, {
                  e,
                })
              }
              className="font-mono text-[11px] text-blue-500 underline cursor-pointer decoration-dotted hover:decoration-solid"
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex items-center gap-1">
              <Copy size={12} />
              <span>Нажмите, чтобы скопировать</span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // HTTP-метод (GET/POST/PUT/PATCH/DELETE), в т.ч. в кавычках
  {
    pattern: /"?\b(GET|POST|PUT|PATCH|DELETE)\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <span key={key} className="font-mono text-[11px] text-blue-500">
          {hasLeadingQuote ? '"' : null}
          {value}
          {hasTrailingQuote ? '"' : null}
        </span>
      );
    },
  },

  // HTTP-путь вида src/test/ui или /test/ui и т.п., в т.ч. в кавычках
  {
    pattern: /"?([^\s",)]+\/[^\s",)]*)"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      let url: URL | null;
      try {
        const value2 = value.replace(/\.$/, '');
        url = new URL(value2);
      } catch (error) {
        url = null;
      }

      const urlString = url?.toString();

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) =>
                handleClickCopy(urlString || value, {
                  e,
                })
              }
              className="cursor-pointer font-mono text-[11px] underline decoration-dotted hover:decoration-solid text-amber-600"
            >
              {hasLeadingQuote ? '"' : null}
              {value}
              {hasTrailingQuote ? '"' : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex flex-col min-w-[350px] w-fit max-w-[500px] gap-1">
              {urlString && (
                <ExternalIframe
                  src={urlString}
                  title={value}
                  className="-ml-1.5 w-[calc(500px_+_var(--spacing)_*_3)] rounded-sm origin-top-left h-[200px]"
                />
              )}
              <div className={cn('flex flex-row gap-2', urlString && 'mt-0.5')}>
                <Button
                  className={
                    'flex items-center gap-1 h-5 -ml-1.5 pl-2 font-normal rounded-sm'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClickCopy(urlString || value, {
                      e,
                    });
                  }}
                  variant="default"
                  size="sm"
                >
                  <Copy size={10} className="h-3! w-3!" />
                  <span>Нажмите, чтобы скопировать</span>
                </Button>
                <Button
                  className={
                    'flex items-center gap-1 h-5 pl-2 font-normal rounded-sm'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // В новом окне
                    window.open(urlString, '_blank');
                  }}
                  variant="default"
                  size="sm"
                >
                  <ExternalLink size={10} className="h-3! w-3!" />
                  <span>Перейти</span>
                </Button>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  // HTTP-статус-код 1xx–5xx, в т.ч. в кавычках
  {
    pattern: /"?\b([1-5][0-9]{2})\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const codeVal = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      const code = Number(codeVal);
      const colorCls = getStatusColorClass(code);

      return (
        <span key={key} className={`font-mono text-[11px] ${colorCls}`}>
          {hasLeadingQuote ? '"' : null}
          {code}
          {hasTrailingQuote ? '"' : null}
        </span>
      );
    },
  },

  // Все, что в "" (fallback — после специализированных паттернов)
  {
    pattern: /"([^"]*)"/g,
    render: (match, key) => (
      <span key={key} className="font-mono text-[11px] text-green-600">
        {match[0]}
      </span>
    ),
  },

  // Любые цифры (в т.ч. в кавычках)
  {
    pattern: /"?\b(\d+)\b"?/g,
    render: (match, key) => {
      const raw = match[0];
      const value = match[1] ?? raw.replace(/^"+|"+$/g, '');
      const hasLeadingQuote = raw.startsWith('"');
      const hasTrailingQuote = raw.endsWith('"');

      return (
        <span key={key} className="font-mono text-[11px] text-violet-600">
          {hasLeadingQuote ? '"' : null}
          {value}
          {hasTrailingQuote ? '"' : null}
        </span>
      );
    },
  },
];

/**
 * Универсальный разбор строки по набору RegExp-правил.
 * Идём слева направо, на каждом шаге берём самое раннее совпадение
 * среди всех правил, не допуская перекрытий.
 */
function highlightTextWithRules(
  text: string,
  rules: readonly HighlightRule[]
): Array<string | JSX.Element> {
  if (!rules.length || !text) return [text];

  const result: Array<string | JSX.Element> = [];
  let index = 0;
  let tokenIdx = 0;

  while (index < text.length) {
    // Индекс правила с самым ранним совпадением
    let earliestRuleIndex = -1;
    let earliestMatch: RegExpExecArray | null = null;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]!;
      const re = rule.pattern;
      re.lastIndex = index;
      const m = re.exec(text);
      if (!m) continue;

      if (
        !earliestMatch ||
        m.index < earliestMatch.index ||
        (m.index === earliestMatch.index && i < earliestRuleIndex)
      ) {
        earliestMatch = m;
        earliestRuleIndex = i;
      }
    }

    if (!earliestMatch || earliestRuleIndex === -1) {
      // больше совпадений нет — добавляем остаток строки и выходим
      result.push(text.slice(index));
      break;
    }

    if (earliestMatch.index > index) {
      result.push(text.slice(index, earliestMatch.index));
    }

    const key = `h-${tokenIdx++}`;
    const rule = rules[earliestRuleIndex]!;
    result.push(rule.render(earliestMatch, key));

    index = earliestMatch.index + earliestMatch[0].length;
  }

  return result;
}

export default highlightTextWithRules;
