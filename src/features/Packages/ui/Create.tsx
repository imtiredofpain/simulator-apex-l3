import { FormGenerator, type FormGeneratorRef } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { CircleX, Save } from 'lucide-react';
import { schemeFormPackage } from '../models/schemeFormPackage';
import { useQueryProducts } from '@features/Products';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumUnit } from '@shared/api/hooks/enums/types';
import { useMemo, useRef } from 'react';
import { endpoints } from '@shared/api/endpoints';
import type { CreatePackageDto } from '../types';
import { apiClientInn } from '@shared/api/httpInn';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function CreatePackagePage() {
  const refPackageForm = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();
  const { data: { data: products } = {}, isLoading: isLoadingProducts } =
    useQueryProducts();
  const { data: { data: packageLevels } = {}, isLoading: isLoadingLevels } =
    useEnum<EnumUnit>({
      name: 'package-levels',
    });
  const {
    data: { data: emissionsMethod } = {},
    isLoading: isLoadingEmissions,
  } = useEnum<EnumUnit>({
    name: 'emission-method',
  });

  const scheme = useMemo(() => {
    const productOptions =
      products?.map((product) => ({
        value: product.id.toString(),
        label: product.name.toString(),
      })) || [];

    const emissionMethodOptions =
      Object.keys(emissionsMethod || {}).map((key) => ({
        value: key,
        label:
          emissionsMethod?.[key].description +
            ' - ' +
            emissionsMethod?.[key].name || '',
      })) || [];

    const packLevelOptions =
      Object.keys(packageLevels || {}).map((key) => ({
        value: key,
        label:
          packageLevels?.[key].description +
            ' - ' +
            packageLevels?.[key].name || '',
      })) || [];

    return schemeFormPackage({
      packLevelOptions,
      productOptions,
      emissionMethodOptions,
    });
  }, [products, packageLevels, emissionsMethod]);

  const handleSave = async () => {
    if (!refPackageForm.current) return;
    const submit = await refPackageForm.current.submit();
    if (!submit?.success) return;
    const values = refPackageForm.current.getValues();
    if (!values) return;
    console.log(values);
    const res = await endpoints.packages.create.call<CreatePackageDto>(
      apiClientInn,
      {
        body: {
          packageLevel: Number(values.packageLevel),
          emissionMethod: Number(values.emissionMethod),
          ean: values.ean,
          name: values.name,
          manualEmissionPattern: values.manualEmissionPattern,
          manualBarcodePattern: values.manualBarcodePattern,
          useBuffer: values.useBuffer,
          minBufferSize: values.minBufferSize,
          productId: Number(values.productId),
        },
      }
    );
    if (res.isSuccess) toast.success('Продукт успешно создан');
    if (!res.isSuccess) toast.error('Произошла ошибка ' + res.message);
    navigate(-1);
  };

  const handleCancel = () => navigate(-1);

  return (
    <SimplePage
      title={'Создание упаковки'}
      isLoading={isLoadingProducts || isLoadingLevels || isLoadingEmissions}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button
            onClick={handleSave}
            variant="submit"
            className="dark:text-white"
          >
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
          definition={scheme}
          ref={refPackageForm}
          key={1}
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

export { CreatePackagePage };
