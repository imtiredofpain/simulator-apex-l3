import { cn } from '@shared/lib/utils';
import { memo } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Label } from '@shared/components/ui/label';
import { Input } from '@shared/components/ui/input';
import type { IUserLogin } from '@shared/types/users';

const FieldPassword = memo(function FieldPassword({
  isLoading,
  label,
  requiredMsg,
  minLenMsg,
}: {
  isLoading: boolean;
  label: string;
  requiredMsg: string;
  minLenMsg: string;
}) {
  const { control } = useFormContext<IUserLogin>();
  const { field, fieldState } = useController({
    name: 'password',
    control,
    rules: {
      required: requiredMsg,
      minLength: { value: 3, message: minLenMsg },
    },
  });

  return (
    <div className={cn('grid gap-3', isLoading && 'opacity-0')}>
      <div className="flex items-center">
        <Label htmlFor="password">{label}</Label>
      </div>
      <Input
        id="password"
        type="password"
        tabIndex={2}
        disabled={isLoading}
        {...field}
      />
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
});

export default FieldPassword;
