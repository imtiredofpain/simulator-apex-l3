import { useNavigate, useParams } from 'react-router-dom';
import { useQueryPackage } from '../hooks/useQueryPackage';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { SquarePen } from 'lucide-react';
import { FormGenerator } from '@mrdn/app-common';
import { schemePackage } from '../models/schemePackage';
import { PATHS } from '@shared/config/pathRoute';

function PackagePage() {
  const { id } = useParams();
  const navigation = useNavigate();
  const { data } = useQueryPackage(id);

  const handleEdit = () => {
    navigation(PATHS.packages.create);
  };

  return (
    <SimplePage
      title={data?.name || ''}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button variant="submit" onClick={handleEdit}>
            <SquarePen className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        </div>
      }
      contentComponent={
        <FormGenerator
          definition={schemePackage}
          initialValues={{ ...data, gtin: data?.product.gtin }}
          key={data?.id}
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

export { PackagePage };
