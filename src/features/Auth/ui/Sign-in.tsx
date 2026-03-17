import type { AxiosInstance } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Spin } from '@mrdn/app-common';
import type { LoadStep } from '../types';
import STEPS from '../steps';
import LoginHeader from './LoginHeader';
import FieldLogin from './FieldLogin';
import FieldPassword from './FieldPassword';
import LoadingStepsPanel from './LoadingStepsPanel';
import SubmitRow from './SubmitRow';
import { endpoints } from '@shared/api/endpoints';
import useAxios from '@shared/api/hooks/useAxios';
import useLogin from '../hooks/useLogin';
import extractApiError from '@shared/api/extractApiError';
import type { IUser, IUserLogin } from '@shared/types/users';
import useHasLogin from '../hooks/useHasLogin';
import { PATHS } from '@shared/config/pathRoute';
// import { StatusConnect } from '@features/Status';

// Хелперы для пошаговой загрузки (через кеш tanstack-query)
async function prefetchProfile(
  qc: ReturnType<typeof useQueryClient>,
  http: AxiosInstance
) {
  await qc.fetchQuery({
    queryKey: ['current'],
    queryFn: async () => {
      const res = await endpoints.auth.current.call<IUser>(http);
      const data = res.data;
      if (
        data == null ||
        (typeof data === 'object' && Object.keys(data).length === 0)
      ) {
        const err: any = new Error('Empty /current response');
        err.response = {
          data: {
            message: 'Empty /current response',
            errorCode: 'EMPTY_BODY',
            statusCode: res.statusCode,
          },
        };
        throw err;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

const ERROR_MESSAGES = {
  SERVER_ERROR: 'Ошибка соединения с сервером. Попробуйте снова.',
  LOGIN_FAILED: 'Ошибка авторизации. Проверьте логин или пароль.',
};

const LoginForm = forwardRef(function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  const [loadingSteps, setLoadingSteps] = useState<LoadStep[]>(STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: dataHasLogin, isPending: isPendingHasLogin } = useHasLogin();

  const { t } = useTranslation();

  const qc = useQueryClient();
  const http = useAxios();
  const loginMutation = useLogin();

  const methods = useForm<IUserLogin>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    delayError: 400,
    defaultValues: {
      login: import.meta.env.VITE_APP_LOGIN || '',
      password: import.meta.env.VITE_APP_PASSWORD || '',
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const onSubmit = useCallback(
    async (payload: IUserLogin) => {
      setIsLoading(true);
      try {
        await loginMutation.mutateAsync(payload);
        setStep(2);
      } catch (error: any) {
        const api = extractApiError(error);
        const errorMessage = api.message || ERROR_MESSAGES.LOGIN_FAILED;
        toast.error(errorMessage, { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation]
  );

  useEffect(() => {
    let isCancelled = false;
    async function runSteps() {
      if (step !== 2) return;
      setLoadingSteps(STEPS.map((s) => ({ ...s, status: 'pending' })));
      setCurrentStepIndex(0);

      for (let i = 0; i < STEPS.length; i++) {
        if (isCancelled) return;
        setCurrentStepIndex(i);
        setLoadingSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s))
        );

        try {
          const key = STEPS[i].key;
          if (key === 'profile') await prefetchProfile(qc, http);
          // else if (key === 'plants') await prefetchPlants(qc, http);
          // else if (key === 'references') await prefetchReferences(qc, http);
          // else if (key === 'settings') await prefetchSettings(qc, http);
          else await new Promise((res) => setTimeout(res, 400)); // fallback
          if (isCancelled) return;
          setLoadingSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s))
          );
        } catch (e: any) {
          setLoadingSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: 'error' } : s))
          );
          const api = extractApiError(e);
          const msg = api.message || 'Ошибка загрузки данных';
          toast.error(msg);
          return; // прерываем bootstrap
        }
      }

      if (!isCancelled) {
        await new Promise((res) => setTimeout(res, 400));
        navigate(PATHS.home, { replace: true });
      }
    }
    runSteps();
    return () => {
      isCancelled = true;
    };
  }, [step, navigate, qc, http]);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current)
        setContentHeight(contentRef.current.scrollHeight || 0);
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    return () => {
      if (contentRef.current) resizeObserver.unobserve(contentRef.current);
      resizeObserver.disconnect();
    };
  }, [step]);

  if (dataHasLogin?.isValid && step === 1) {
    return <Navigate to={PATHS.home} replace />;
  }

  return (
    <motion.div
      className="p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex flex-col gap-6">
        <LoginHeader
          title={t('signIn.title') || 'Добро пожаловать'}
          description={
            t('signIn.description') || 'Войдите в свою учетную запись'
          }
          showDescription={step === 1}
        />

        <AnimatePresence mode="popLayout">
          <FormProvider {...methods}>
            <motion.form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="contents"
            >
              <motion.div
                key={step}
                initial={{ x: '100%', height: contentHeight }}
                animate={{ x: '0%', height: contentHeight }}
                exit={{ x: '-100%', height: contentHeight }}
                transition={{
                  x: { duration: 0.5, ease: 'easeInOut' },
                  height: { duration: 0.5, ease: 'easeInOut' },
                }}
                className="flex flex-col gap-6 min-h-[154px]"
              >
                <motion.div
                  ref={contentRef}
                  className="relative flex flex-col gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.5, ease: 'easeInOut' },
                  }}
                >
                  {step === 1 && (
                    <>
                      {(isLoading || isPendingHasLogin) && (
                        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full mt-[30px]">
                          <Spin size={40} width={5} className="text-white!" />
                        </div>
                      )}

                      <FieldLogin
                        isLoading={isLoading || isPendingHasLogin}
                        label={t('signIn.login') || 'Логин'}
                        requiredMsg={
                          t('signIn.error.loginRequired') || 'Login is required'
                        }
                        invalidMsg={'signIn.error.loginInvalid'}
                      />

                      <FieldPassword
                        isLoading={isLoading || isPendingHasLogin}
                        label={t('signIn.password') || 'Пароль'}
                        requiredMsg={
                          t('signIn.error.passwordRequired') ||
                          'Password is required'
                        }
                        minLenMsg={
                          t('signIn.error.passwordMinLength') ||
                          'Password must be at least 6 characters'
                        }
                      />
                    </>
                  )}

                  {step === 2 && (
                    <LoadingStepsPanel
                      steps={loadingSteps}
                      currentIndex={currentStepIndex}
                    />
                  )}
                </motion.div>
              </motion.div>

              {step === 1 && (
                <>
                  <SubmitRow
                    isLoading={isLoading || isPendingHasLogin}
                    isValid={isValid}
                    submitText={t('signIn.submit') || 'Авторизоваться'}
                  />

                  {/* <div className="text-sm text-center">
                    <a
                      href={`mailto:test@local.host?subject=${encodeURIComponent(
                        'нужна регистрация ...'
                      )}`}
                      className="underline underline-offset-4"
                    >
                      {t('signIn.noAccount') || 'Еще нет учетной записи?'}
                    </a>
                  </div> */}
                </>
              )}
            </motion.form>
          </FormProvider>
        </AnimatePresence>
      </div>
      {/* <div className="absolute left-0 right-0 z-50 flex flex-col items-center justify-center bottom-3">
        <StatusConnect />
      </div> */}
    </motion.div>
  );
});

export default memo(LoginForm);
