import { Button } from '@shared/components/ui/button';
import { cn } from '@shared/lib/utils';
import { memo } from 'react';

const SubmitRow = memo(function SubmitRow({
  isLoading,
  isValid,
  submitText,
}: {
  isLoading: boolean;
  isValid: boolean;
  submitText: string;
}) {
  return (
    <Button
      type="submit"
      className={cn('w-full', isLoading && 'opacity-0!')}
      disabled={isLoading || !isValid}
      tabIndex={3}
    >
      {isLoading ? 'Загрузка…' : submitText}
    </Button>
  );
});

export default SubmitRow;
