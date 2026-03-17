import { cn } from '@shared/lib/utils';
import { memo } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Label } from '@shared/components/ui/label';
import { Input } from '@shared/components/ui/input';
import type { IUserLogin } from '@shared/types/users';

const FieldLogin = memo(function FieldLogin({
  isLoading,
  label,
  invalidMsg,
  requiredMsg,
}: {
  isLoading: boolean;
  label: string;
  invalidMsg: string;
  requiredMsg: string;
}) {
  const { control } = useFormContext<IUserLogin>();
  const { field, fieldState } = useController({
    name: 'login',
    control,
    rules: {
      required: requiredMsg,
      validate: (v: string) => {
        const isEmail = /^\S+@\S+\.\S+$/.test(v);
        const isUsername = /^[A-Za-z0-9._-]{3,30}$/.test(v);
        return isEmail || isUsername || invalidMsg;
      },
    },
  });

  return (
    <div className={cn('grid gap-3', isLoading && 'opacity-0')}>
      <Label htmlFor="login">{label}</Label>
      <Input
        id="login"
        type="text"
        placeholder="PetrovAV"
        tabIndex={1}
        disabled={isLoading}
        {...field}
      />
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
});

export default FieldLogin;
