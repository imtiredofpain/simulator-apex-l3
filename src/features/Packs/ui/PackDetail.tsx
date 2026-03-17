import { useParams } from "react-router-dom";
import { useQueryPack } from "../hooks/useQueryPack";
import { SimplePage } from "@shared/components/SimplePage";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";

function PackDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: pack, isLoading } = useQueryPack(id);

  const displayId = id || pack?.id || "—";

  if (isLoading) {
    return (
      <SimplePage
        title={`Пакет #${displayId}`}
        isLoading
        contentComponent={<div>Загрузка данных пакета...</div>}
      />
    );
  }

  return (
    <SimplePage
      title={`Пакет #${displayId}`}
      contentComponent={
        <div className="space-y-4">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о пакете</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Info label="ID" value={displayId} />
              <Info label="ИНН" value={pack?.inn} />
              <Info label="Уровень упаковки" value={pack?.level} />
              <Info label="Статус" value={pack?.status} />
              <Info label="Production status" value={pack?.productionStatus} />
              <Info label="IC" value={pack?.ic} />
            </CardContent>
          </Card>

          {/* Code */}
          <Card>
            <CardHeader>
              <CardTitle>Код</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="IC" value={pack?.code?.ic} />
              <Info label="Номер партии" value={pack?.code?.lotNumber || "—"} />
              <Info
                label="Дата производства"
                value={pack?.code?.productionTime ?? "—"}
              />
              <Info
                label="Срок годности"
                value={pack?.code?.expirationTime ?? "—"}
              />
            </CardContent>
          </Card>

          {/* Флаги */}
          <Card>
            <CardHeader>
              <CardTitle>Текущее состояние</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {pack &&
                Object.entries(pack.currentState).map(([key, value]) => (
                  <Flag key={key} label={key} value={value} />
                ))}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value ?? "—"}</p>
    </div>
  );
}

function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export { PackDetail };
