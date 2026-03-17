import { useQueryProduct } from '@features/Products/hooks/useQueryProduct';
import { FormGenerator } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import { SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { schemeProduct } from './schemeProduct';

function Product() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data: { data: product, timestamp } = {}, isLoading } =
    useQueryProduct(id);

  if (isLoading || !product || !id || !timestamp) return;

  const handleEdit = () => {
    navigate(PATHS.products.edit(id));
  };

  return (
    <SimplePage
      title={product?.name || ''}
      isLoading={isLoading}
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
          definition={schemeProduct}
          initialValues={{ ...product }}
          key={timestamp + product?.id}
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

export { Product };
