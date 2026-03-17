import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Badge } from '@shared/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

export interface ParamEntry {
  key: string;
  value: string;
  kind?: 'required' | 'optional' | 'custom';
}

interface ParametersEditorProps {
  params: ParamEntry[];
  onChange: (params: ParamEntry[]) => void;
}

export function paramsToRecord(params: ParamEntry[]): Record<string, unknown> | undefined {
  const filled = params.filter((p) => p.key.trim());
  if (filled.length === 0) return undefined;
  const record: Record<string, unknown> = {};
  for (const { key, value } of filled) {
    try {
      record[key] = JSON.parse(value);
    } catch {
      record[key] = value;
    }
  }
  return record;
}

export function ParametersEditor({ params, onChange }: ParametersEditorProps) {
  const addParam = () => {
    onChange([...params, { key: '', value: '', kind: 'custom' }]);
  };

  const removeParam = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value', val: string) => {
    const next = params.map((p, i) =>
      i === index ? { ...p, [field]: val } : p
    );
    onChange(next);
  };

  const kindBadge = (kind?: string) => {
    if (kind === 'required')
      return <Badge variant="destructive" className="text-xs shrink-0">обяз.</Badge>;
    if (kind === 'optional')
      return <Badge variant="secondary" className="text-xs shrink-0">необяз.</Badge>;
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Параметры</Label>
        <Button variant="outline" size="sm" onClick={addParam} type="button">
          <Plus className="w-3 h-3 mr-1" />
          Добавить
        </Button>
      </div>

      {params.length === 0 && (
        <span className="text-sm text-muted-foreground">Нет параметров</span>
      )}

      {params.map((param, index) => (
        <div key={index} className="flex items-center gap-2">
          {kindBadge(param.kind)}
          <Input
            placeholder="Ключ"
            value={param.key}
            onChange={(e) => updateParam(index, 'key', e.target.value)}
            className="flex-1"
            readOnly={param.kind === 'required' || param.kind === 'optional'}
          />
          <Input
            placeholder="Значение"
            value={param.value}
            onChange={(e) => updateParam(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeParam(index)}
            type="button"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
