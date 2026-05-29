import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { ScriptEditor } from './ScriptEditor';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Play, Copy, Download } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutationGenerate } from '../hooks/useMutationGenerate';
import { useMutationExecute } from '../hooks/useMutationExecute';
import { useQueryScripts } from '../hooks/useQueryScripts';
import { toast } from 'sonner';
import { ParametersEditor, paramsToRecord, type ParamEntry } from './ParametersEditor';
import { parseScriptMetadata } from '../utils/parseScriptMetadata';

function buildParamsFromMeta(
  required: string[],
  optional: string[],
  existing: ParamEntry[]
): ParamEntry[] {
  const valueMap = new Map(existing.map((p) => [p.key, p.value]));
  const customParams = existing.filter((p) => p.kind === 'custom');

  const metaParams: ParamEntry[] = [
    ...required.map((key) => ({
      key,
      value: valueMap.get(key) ?? '',
      kind: 'required' as const,
    })),
    ...optional.map((key) => ({
      key,
      value: valueMap.get(key) ?? '',
      kind: 'optional' as const,
    })),
  ];

  return [...metaParams, ...customParams];
}

export function GeneratePage() {
  const [searchParams] = useSearchParams();
  const initialScriptId = searchParams.get('scriptId');

  const [mode, setMode] = useState<'script' | 'custom'>(
    initialScriptId ? 'script' : 'custom'
  );
  const [scriptId, setScriptId] = useState(initialScriptId || '');
  const [quantity, setQuantity] = useState(1);
  const [customCode, setCustomCode] = useState('');
  const [params, setParams] = useState<ParamEntry[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const { data: { data: scripts } = {} } = useQueryScripts();

  // При выборе существующего скрипта — парсим metadata из его кода
  useEffect(() => {
    if (mode !== 'script' || !scriptId || !scripts) return;
    const script = scripts.find((s) => String(s.id) === scriptId);
    if (!script) return;

    const meta = parseScriptMetadata(script.script);
    if (!meta) {
      setParams((prev) => prev.filter((p) => p.kind === 'custom'));
      return;
    }

    setParams((prev) =>
      buildParamsFromMeta(meta.requiredParameters, meta.optionalParameters, prev)
    );
  }, [scriptId, scripts, mode]);

  // При вводе кастомного скрипта — парсим metadata с дебаунсом
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleCustomCodeChange = useCallback((code: string) => {
    setCustomCode(code);

    clearTimeout(parseTimerRef.current);
    parseTimerRef.current = setTimeout(() => {
      const meta = parseScriptMetadata(code);
      if (!meta) return;

      setParams((prev) =>
        buildParamsFromMeta(meta.requiredParameters, meta.optionalParameters, prev)
      );
    }, 500);
  }, []);

  const generateMutation = useMutationGenerate((status) => {
    if (status === 'success') toast.success('Коды сгенерированы');
    else toast.error('Ошибка генерации');
  });

  const executeMutation = useMutationExecute((status) => {
    if (status === 'success') toast.success('Коды сгенерированы');
    else toast.error('Ошибка генерации');
  });

  const isLoading = generateMutation.isPending || executeMutation.isPending;

  const handleGenerate = useCallback(async () => {
    // Проверяем обязательные параметры
    const emptyRequired = params.filter(
      (p) => p.kind === 'required' && !p.value.trim()
    );
    if (emptyRequired.length > 0) {
      toast.error(
        `Заполните обязательные параметры: ${emptyRequired.map((p) => p.key).join(', ')}`
      );
      return;
    }

    if (mode === 'script') {
      if (!scriptId) {
        toast.error('Выберите скрипт');
        return;
      }
      const res = await generateMutation.mutateAsync({
        scriptId: Number(scriptId),
        quantity,
        parameters: paramsToRecord(params),
      });
      if (res.data?.codes) setResults(res.data.codes);
      else if (res.data?.error) toast.error(res.data.error);
    } else {
      if (!customCode.trim()) {
        toast.error('Введите код скрипта');
        return;
      }
      const res = await executeMutation.mutateAsync({
        scriptCode: customCode,
        quantity,
        parameters: paramsToRecord(params),
      });
      if (res.data?.codes) setResults(res.data.codes);
      else if (res.data?.error) toast.error(res.data.error);
    }
  }, [mode, scriptId, quantity, customCode, params, generateMutation, executeMutation]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(results.join('\n'));
    toast.success('Скопировано в буфер обмена');
  }, [results]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([results.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codes_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <SimplePage
      title="Генерация кодов"
      contentComponent={
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Параметры генерации</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button
                  variant={mode === 'script' ? 'default' : 'outline'}
                  onClick={() => setMode('script')}
                >
                  Существующий скрипт
                </Button>
                <Button
                  variant={mode === 'custom' ? 'default' : 'outline'}
                  onClick={() => setMode('custom')}
                >
                  Свой скрипт
                </Button>
              </div>

              {mode === 'script' ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="scriptId">Скрипт</Label>
                  <select
                    id="scriptId"
                    value={scriptId}
                    onChange={(e) => setScriptId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Выберите скрипт...</option>
                    {scripts?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (v{s.version})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label>Код скрипта</Label>
                  <ScriptEditor
                    value={customCode}
                    onChange={handleCustomCodeChange}
                    height="300px"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 max-w-xs">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                />
              </div>

              <ParametersEditor params={params} onChange={setParams} />

              <div>
                <Button
                  variant="submit"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isLoading ? 'Генерация...' : 'Сгенерировать'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Результат ({results.length} кодов)
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-1" />
                    Копировать
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    Скачать
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
                  {results.join('\n')}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      }
    />
  );
}
