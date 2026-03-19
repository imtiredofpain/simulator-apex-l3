import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { Pencil, Play } from 'lucide-react';
import { ScriptEditor } from './ScriptEditor';
import { useNavigate, useParams } from 'react-router-dom';
import useQueryScript from '../hooks/useQueryScript';
import { PATHS } from '@shared/config/pathRoute';
import { Badge } from '@shared/components/ui/badge';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';

export function ScriptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: { data: script } = {}, isLoading } = useQueryScript(id);

  if (isLoading || !script || !id) return null;

  return (
    <SimplePage
      title={script.name}
      actionComponent={
        <div className="flex flex-row items-center gap-3">
          <Button
            variant="submit"
            onClick={() => {
              navigate(PATHS.codeGeneration.generate + `?scriptId=${script.id}`);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Генерировать коды
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate(PATHS.codeGeneration.edit(script.id));
            }}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        </div>
      }
      contentComponent={
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Информация</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">ID</span>
                <p>{script.id}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Версия</span>
                <p>{script.version}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Статус</span>
                <p>
                  <Badge variant={script.isActive ? 'default' : 'secondary'}>
                    {script.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Описание</span>
                <p>{script.description || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Дата создания</span>
                <p>{new Date(script.createdAt).toLocaleString()}</p>
              </div>
              {script.updatedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">Дата обновления</span>
                  <p>{new Date(script.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Скрипт</h3>
            </CardHeader>
            <CardContent>
              <ScriptEditor
                value={script.script}
                onChange={() => {}}
                height="400px"
                readOnly
              />
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
