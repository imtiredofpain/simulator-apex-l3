import { FormGenerator, Spin, type FormGeneratorRef } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import { CircleX, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumUnit } from '@shared/api/hooks/enums/types';
import { useRef } from 'react';
import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { toast } from 'sonner';
import type { ProductDto } from '@features/Products/types';
import { schemeFormProduct } from './schemeFormProduct';
import { useQueryProduct } from '../hooks/useQueryProduct';

function EditProduct() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const refForm = useRef<FormGeneratorRef>(null);
  const {
    data: { data: productGroups = {} } = {},
    isLoading: isLoadingProductGroups,
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

  const { data: { data: product } = {}, isLoading: isLoadingProduct } =
    useQueryProduct(id, false);

  const handleSave = async (id: string) => {
    if (!refForm.current) return;
    const submit = await refForm.current.submit();
    if (!submit?.success) return;
    const values = refForm.current.getValues();
    if (!values) return;
    const res = await endpoints.products.update.call<ProductDto>(apiClientInn, {
      params: { id },
      body: {
        ...values,
        usageType: Number(values.usageType),
        useLicense: false,
        productGroup: Number(values.productGroup),
        shelfLifeUnit: Number(values.shelfLifeUnit),
      },
    });
    if (res.isSuccess) toast.success('Продукт успешно обновлен');
    if (!res.isSuccess) toast.error('Произошла ошибка ' + res.message);
    navigate(PATHS.products.byId(id));
  };

  const handleCancel = () => {
    navigate(PATHS.products.byId(id));
  };

  const isLoaded =
    !isLoadingProduct &&
    !isLoadingLife &&
    !isLoadingUsageTypes &&
    !isLoadingProductGroups;

  return (
    <SimplePage
      title={'*' + product?.name}
      isLoading={isLoadingProduct || isLoadingLife || isLoadingUsageTypes}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={() => handleSave(id)} variant="submit">
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
        !isLoaded ? (
          <div className="flex items-center justify-center h-40">
            <Spin />
          </div>
        ) : (
          <FormGenerator
            ref={refForm}
            initialValues={{ ...product }}
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
        )
      }
    />
  );
}

export { EditProduct };
