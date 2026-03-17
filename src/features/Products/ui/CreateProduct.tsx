import { FormGenerator, type FormGeneratorRef } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import { CircleX, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initialValues, schemeFormProduct } from './schemeFormProduct';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumUnit } from '@shared/api/hooks/enums/types';
import { useRef } from 'react';
import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { toast } from 'sonner';
import type { ProductDto } from '@features/Products/types';

function CreateProduct() {
  const navigate = useNavigate();
  const refForm = useRef<FormGeneratorRef>(null);
  const {
    data: { data: productGroups = {} } = {},
    isLoading: isLoadingProduct,
  } = useEnum<EnumUnit>({
    name: 'product-groups',
  });
  const { data: { data: shelfLife = {} } = {}, isLoading: isLoadingLife } =
    useEnum<EnumUnit>({
      name: 'shelf-life-units',
    });
  const {
    data: { data: usageTypes = {} } = {},
    isLoading: isLoadingUsageTypes,
  } = useEnum<EnumUnit>({
    name: 'product-usage-types',
  });

  const handleSave = async () => {
    if (!refForm.current) return;
    const submit = await refForm.current.submit();
    if (!submit?.success) return;
    const values = refForm.current.getValues();
    if (!values) return;
    const res = await endpoints.products.create.call<ProductDto>(apiClientInn, {
      body: {
        ...values,
        usageType: Number(values.usageType),
        useLicense: false,
        productGroup: Number(values.productGroup),
        shelfLifeUnit: Number(values.shelfLifeUnit),
      },
    });
    if (res.isSuccess) toast.success('Продукт успешно создан');
    if (!res.isSuccess) toast.error('Произошла ошибка ' + res.message);
    navigate(PATHS.products.main);
  };

  const handleCancel = () => {
    navigate(PATHS.products.main);
  };

  return (
    <SimplePage
      title={'Создание продукта'}
      isLoading={isLoadingProduct || isLoadingLife || isLoadingUsageTypes}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={handleSave} variant="submit">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      contentComponent={
        <FormGenerator
          ref={refForm}
          initialValues={initialValues}
          definition={schemeFormProduct({
            productGroups,
            shelfLife,
            usageTypes,
          })}
          engineConfig={{
            clearOnHideDefault: true,
            visibleSubmitButton: true,
            visibleCancelButton: false,
            visibleErrors: true,
          }}
        />
      }
    />
  );
}

export { CreateProduct };
