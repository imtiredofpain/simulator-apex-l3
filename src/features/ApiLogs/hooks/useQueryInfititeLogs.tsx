import type { ApiPagedEnvelope } from '@shared/api/contracts';
import { endpoints } from '@shared/api/endpoints';
import type { LogsDto } from '../types';
import { apiClientInn } from '@shared/api/httpInn';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SIZE_PAGE } from '../CONST';

const queryFn = ({
  pageParam = 1,
}: {
  pageParam: unknown;
}): Promise<ApiPagedEnvelope<LogsDto>> =>
  endpoints.apiLogs.list.call(apiClientInn, {
    query: { page: pageParam, size: SIZE_PAGE },
  });

function useQueryInfinitiLogs() {
  return useInfiniteQuery<ApiPagedEnvelope<LogsDto>>({
    queryKey: [...endpoints.apiLogs.list.__tags],
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
}

export default useQueryInfinitiLogs;
