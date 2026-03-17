'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@shared/lib/utils';
import { useSetting } from '@features/Settings/model/hooks';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const { value } = useSetting<boolean>('switchLabel');
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-[#66bb6a] data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.25rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'shadow-none relative flex-shrink-0',
        className
      )}
      data-visible-label={value}
      {...props}
    >
      {value && (
        <div className="absolute top-1/2 left-[7px] -translate-y-1/2 w-[1px] h-[calc(100%-10px)] bg-[#42a347] z-1"></div>
      )}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-3px)] data-[state=unchecked]:translate-x-[1px]',
          'z-3'
        )}
      />
      {value && (
        <div className="absolute top-1/2 right-[4px] -translate-y-1/2 w-[8px] h-[8px] border-[#7b7b7b3d] z-1 rounded-full border-1"></div>
      )}
    </SwitchPrimitive.Root>
  );
}

export { Switch };
