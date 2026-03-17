import { useSearchParams } from "react-router-dom";
import { SimplePage } from "@shared/components/SimplePage";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useQueryTasksList } from "../hooks/useQueryTasksList";
import { PackStats } from "./PackStats";

function PackStatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tasks, isLoading: isLoadingTasks } = useQueryTasksList();

  // Получаем jobId из query параметров
  const jobIdFromUrl = searchParams.get("jobId");
  const jobId = jobIdFromUrl;

  const handleJobIdChange = (value: string) => {
    if (value) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("jobId", value);
      setSearchParams(newParams, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("jobId");
      setSearchParams(newParams, { replace: true });
    }
  };

  return (
    <SimplePage
      title="Статистика пакетов"
      contentComponent={
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Параметры статистики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jobId">Выберите задание</Label>
                <Select
                  value={jobId || ""}
                  onValueChange={handleJobIdChange}
                  disabled={isLoadingTasks}
                >
                  <SelectTrigger id="jobId">
                    <SelectValue placeholder="Выберите задание из списка" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks && tasks.length > 0 ? (
                      tasks.map((task) => (
                        <SelectItem key={task.id} value={String(task.id)}>
                          {task.jobNumber} (ID: {task.id})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {isLoadingTasks ? "Загрузка..." : "Нет доступных заданий"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Выберите задание для получения статистики
                </p>
              </div>
            </CardContent>
          </Card>
          {jobId ? (
            <PackStats jobId={jobId} />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  Выберите задание для отображения статистики
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      }
    />
  );
}

export { PackStatsPage };
