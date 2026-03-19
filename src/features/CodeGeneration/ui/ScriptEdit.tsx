import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { ScriptEditor } from './ScriptEditor';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { CircleX, Play, Save } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutationExecute } from '../hooks/useMutationExecute';
import { endpoints, http } from '@shared/api/endpoints';
import { toast } from 'sonner';
import { PATHS } from '@shared/config/pathRoute';
import type { ScriptDto } from '../types';
import { ParametersEditor, paramsToRecord, type ParamEntry } from './ParametersEditor';
import { parseScriptMetadata } from '../utils/parseScriptMetadata';
import useQueryScript from '../hooks/useQueryScript';

export function ScriptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: { data: script } = {}, isLoading } = useQueryScript(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [testQuantity, setTestQuantity] = useState(1);
  const [testParams, setTestParams] = useState<ParamEntry[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Заполняем форму данными скрипта
  useEffect(() => {
    if (script && !initialized) {
      setName(script.name);
      setDescription(script.description ?? '');
      setScriptCode(script.script);
      setVersion(script.version);
      setInitialized(true);

      // Парсим параметры из кода
      const meta = parseScriptMetadata(script.script);
      if (meta) {
        const allKeys = [
          ...meta.requiredParameters.map((k) => ({ key: k, kind: 'required' as const })),
          ...meta.optionalParameters.map((k) => ({ key: k, kind: 'optional' as const })),
        ];
        if (allKeys.length > 0) {
          setTestParams(allKeys.map(({ key, kind }) => ({ key, value: '', kind })));
        }
      }
    }
  }, [script, initialized]);

  // Дебаунс для парсинга metadata
  const parseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleScriptChange = useCallback((code: string) => {
    setScriptCode(code);

    clearTimeout(parseTimerRef.current);
    parseTimerRef.current = setTimeout(() => {
      const meta = parseScriptMetadata(code);
      if (!meta) return;

      if (meta.version) setVersion(meta.version);

      const allKeys = [
        ...meta.requiredParameters.map((k) => ({ key: k, kind: 'required' as const })),
        ...meta.optionalParameters.map((k) => ({ key: k, kind: 'optional' as const })),
      ];

      if (allKeys.length === 0) return;

      setTestParams((prev) => {
        const existing = new Map(prev.map((p) => [p.key, p]));
        const customParams = prev.filter((p) => p.kind === 'custom');

        const metaParams: ParamEntry[] = allKeys.map(({ key, kind }) => ({
          key,
          value: existing.get(key)?.value ?? '',
          kind,
        }));

        return [...metaParams, ...customParams];
      });
    }, 500);
  }, []);

  const executeMutation = useMutationExecute();
  const isTesting = executeMutation.isPending;

  const handleTest = useCallback(async () => {
    if (!scriptCode.trim()) {
      toast.error('Введите код скрипта');
      return;
    }

    const emptyRequired = testParams.filter(
      (p) => p.kind === 'required' && !p.value.trim()
    );
    if (emptyRequired.length > 0) {
      toast.error(
        `Заполните обязательные параметры: ${emptyRequired.map((p) => p.key).join(', ')}`
      );
      return;
    }

    try {
      const res = await executeMutation.mutateAsync({
        scriptCode,
        quantity: testQuantity,
        parameters: paramsToRecord(testParams),
      });
      if (res.data?.codes) {
        setTestResults(res.data.codes);
        toast.success(`Скрипт выполнен за ${res.data.executionTimeMs}мс`);
      } else if (res.data?.error) {
        toast.error(res.data.error);
      }
    } catch {
      toast.error('Ошибка выполнения скрипта');
    }
  }, [scriptCode, testQuantity, testParams, executeMutation]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Введите название скрипта');
      return;
    }
    if (!scriptCode.trim()) {
      toast.error('Введите код скрипта');
      return;
    }
    setSaving(true);
    try {
      const res = await endpoints.codeGeneration.updateScript.call<ScriptDto>(http, {
        params: { id: id! },
        body: {
          name,
          description: description || null,
          script: scriptCode,
          version,
        },
      });
      if (res.isSuccess) {
        toast.success('Скрипт успешно обновлён');
        navigate(PATHS.codeGeneration.byId(id!));
      }
    } catch {
      toast.error('Ошибка при обновлении скрипта');
    } finally {
      setSaving(false);
    }
  }, [name, description, scriptCode, version, id, navigate]);

  if (isLoading || !script || !id) return null;

  return (
    <SimplePage
      title="Редактирование скрипта"
      actionComponent={
        <div className="flex flex-row items-center gap-3">
          <Button onClick={handleSave} variant="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.codeGeneration.byId(id))}
          >
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      contentComponent={
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Основное</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название скрипта"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="version">Версия</Label>
                  <Input
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание скрипта (необязательно)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Код скрипта</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ScriptEditor
                value={scriptCode}
                onChange={handleScriptChange}
                height="400px"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Тестирование</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end gap-4">
                <div className="flex flex-col gap-2 max-w-xs">
                  <Label htmlFor="testQuantity">Количество</Label>
                  <Input
                    id="testQuantity"
                    type="number"
                    min={1}
                    value={testQuantity}
                    onChange={(e) => setTestQuantity(Number(e.target.value) || 1)}
                  />
                </div>
              </div>

              <ParametersEditor params={testParams} onChange={setTestParams} />

              <div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !scriptCode.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTesting ? 'Выполнение...' : 'Тестировать'}
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Результат ({testResults.length} кодов)
                  </span>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-64">
                    {testResults.join('\n')}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
