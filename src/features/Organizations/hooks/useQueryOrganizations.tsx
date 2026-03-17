import { endpoints } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { OrganizationsDto } from '../types';
import { apiClientInn } from '@shared/api/httpInn';

const queryFn = () =>
  endpoints.organizations.list.call<OrganizationsDto[]>(apiClientInn);

function useQueryOrganizations() {
  return useQuery({
    queryKey: [...endpoints.organizations.list.__tags],
    queryFn,
  });
}

export { useQueryOrganizations };
