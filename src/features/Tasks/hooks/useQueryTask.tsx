import { endpoints, http } from '@shared/api/endpoints';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { JobStatusDetails, TaskDto } from '../types';
import type { EnumsUnits, EnumUnit } from '@shared/api/hooks/enums/types';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { ApiEnvelope } from '@shared/api/contracts';


const queryFn = (id?: TaskDto['id']) =>
  endpoints.tasks.byId.call<{
    job: TaskDto;
    actions: Record<
      string,
      {
        forbidden: boolean;
        why?: string;
      }
    >;
    jobStatusDetails: JobStatusDetails;
  }>(http, { params: { id } });

function useQueryTask(id?: TaskDto['id']) {
  const queryClient = useQueryClient();
  useEnum<EnumUnit>({
    name: 'job-status',
  });
  useEnum<EnumUnit>({
    name: 'job-type',
  });

  return useQuery({
    queryKey: [...endpoints.tasks.byId.__tags, `tasks:byId:${id}`],
    queryFn: () => queryFn(id),
    select: (data) => {
      const enumDataStatus = queryClient.getQueryData<ApiEnvelope<EnumsUnits>>([
        'enums:get',
        'job-status',
      ])?.data;

      const enumDataType = queryClient.getQueryData<ApiEnvelope<EnumsUnits>>([
        'enums:get',
        'job-type',
      ])?.data;

      const result = {
        ...data,
        data: {
          ...data.data,
          job: {
            ...data.data.job,
            jobStatus: enumDataStatus?.[data.data.job.jobStatus].description,
            jobType: enumDataType?.[data.data.job.jobType].description,
          },
        },
      };
      return result;
    },
    enabled: !!id,
  });
}

export default useQueryTask;
