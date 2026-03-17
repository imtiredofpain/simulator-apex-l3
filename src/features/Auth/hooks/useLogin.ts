import useAxios from '@shared/api/hooks/useAxios';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@shared/api/endpoints';
import type { IUserLogin } from '@shared/types/users';

function useLogin() {
  const http = useAxios();
  return useMutation({
    mutationFn: async (payload: IUserLogin) => {
      const res = await endpoints.auth.login.call<string>(http, {
        body: payload,
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.data);
    },
  });
}

export default useLogin;
