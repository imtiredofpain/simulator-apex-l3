import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiEnvelope } from './contracts';
import { t } from 'i18next';

export function handleApiError(
  error: unknown,
  defaultMessage = 'Произошла ошибка'
): void {
  if (error instanceof AxiosError) {
    const status = error.status || 500;
    const data = error.response?.data as ApiEnvelope;

    // Логирование полной ошибки для отладки
    console.error('API Error:', {
      status,
      message: error.message,
      response: error.response,
    });

    if (status === 401) {
      if (
        error.response?.data.message.toLowerCase() ==
        'INN is required'.toLowerCase()
      ) {
        toast.error('Пожалуйста, выберите организацию.');
      } else {
        // Редирект на логин
        toast.error('Сессия истекла. Пожалуйста, войдите заново.');
      }
      return;
    }

    if (status === 403) {
      toast.error('Доступ запрещен.');
      return;
    }

    if (status === 409) {
      toast.error(data?.message || 'Конфликт: ресурс уже существует.');
      return;
    }

    if (status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже.');
      return;
    }

    if (error.response?.data.validationErrors) {
      const errors = [];
      for (const key in error.response?.data.validationErrors) {
        errors.push({
          key: t('keys.' + key),
          error: t('errors.' + error.response?.data.validationErrors[key]),
        });
      }
      toast.error('Произошла ошибка', {
        description: (
          <div>
            {errors.map((error, index) => (
              <div key={index}>
                <span className="font-bold">{error.key}</span>:{' '}
                <span>{error.error}</span>
              </div>
            ))}
          </div>
        ),
      });
      return;
    }

    // Общая клиентская ошибка
    toast.error(
      data?.message
        ? t(data?.message)
        : `Ошибка ${status}: errors.${t(error.message)}`
    );
  } else {
    console.error('Unknown Error:', error);
    toast.error(defaultMessage);
  }
}

//  if (error instanceof AxiosError) {
//         if (error.response?.data.validationErrors) {
//           const errors = [];
//           for (const key in error.response?.data.validationErrors) {
//             errors.push({
//               key: t('keys.' + key),
//               error: t('errors.' + error.response?.data.validationErrors[key]),
//             });
//           }
//           toast.error('Произошла ошибка', {
//             description: (
//               <div>
//                 {errors.map((error, index) => (
//                   <div key={index}>
//                     <span className="font-bold">{error.key}</span>:{' '}
//                     <span>{error.error}</span>
//                   </div>
//                 ))}
//               </div>
//             ),
//           });
//           return;
//         }
//         toast.error('Произошла ошибка', {
//           description: t(`errors.${error.response?.data.message}`),
//         });
//       } else if (error instanceof Error) {
//         toast.error('Произошла ошибка', {
//           description: t(error.message),
//         });
//       } else {
//         toast.error('Произошла ошибка');
//       }
//     }
