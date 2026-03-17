import { useNavigate } from "react-router-dom";
import { useQueryPacks } from "../hooks/useQueryPackQuery";
import { EntityList } from "@shared/components/EntityList";
import { packsColumns } from "../models/packsColumns";
import { PATHS } from "@shared/config/pathRoute";
import { endpoints, http } from "@shared/api/endpoints";
import type { EnumsUnits } from "@shared/api/hooks/enums/types.ts";
import { useQuery } from '@tanstack/react-query';
import { memo } from "react";
import type {  PackDto } from "../types";
import { apiClientInn } from '@shared/api/httpInn.ts';
import type { TaskDto } from "@features/Tasks/types";

const queryFn = () => 
  Promise.all ([
    endpoints.packs.list.call<PackDto[]>(apiClientInn),
    endpoints.tasks.list.call<TaskDto[]>(apiClientInn),
    endpoints.enums.get.call<EnumsUnits>(http, {
      params: {
        name: "package-levels",
      },
    }),
    endpoints.enums.get.call<EnumsUnits>(http, {
      params: {
        name: "pack-status",
      },
    }),

])


function PacksList() {

  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [...endpoints.packs.list.__tags],
    queryFn,
    //refetchInterval: 4000,
    select: ([packs, task, l, s]) => {
     
      const mapTasks = new Map(
        task.data.map((task) => [task.id, task])
      );
      console.log("mapTasks", mapTasks)
      const levels = l.data;
      const statuses = s.data;

      const a = packs.data.map((pack) => {
        return {
          ...pack,
          level: levels[pack.packageLevel],
          status: statuses[pack.status],
          task: pack.reservedForJobId != null
            ? mapTasks.get(pack.reservedForJobId)
            : undefined,
          
          // line: mapLines.get(pack.lineId),
          // type: types[pack.jobType],
          // statusStartTime: undefined,
          // status: statuses[pack.jobStatus],
          // material: pack.materialId
          //   ? mapMaterials.get(pack.materialId)
          //   : undefined,
          // packages: pack.packageId
          //   ? mapPackages.get(pack.packageId)
          //   : undefined,
        };
      });

      console.log(a)
      return a;
    },
  });


  const packsData = data ?? [];
   console.log("packsColumns", JSON.stringify(packsColumns, null, 2))
  const a = (
    <EntityList
      search={{
        placeholder: "Поиск по пакетам...",
      }}
      title={"Пакеты"}
      columns={packsColumns}
      data={packsData}
      isLoading={isLoading}
      hiddenColumns={{
        id: true,
      }}
      onCreate={() => navigate(PATHS.packs.create)}
    />
  );
  
  return a;
}

export default memo(PacksList);
