import { type DropdownMenuLike, ProviderAppCommon } from '@mrdn/app-common';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { Skeleton } from '@shared/components/ui/skeleton';
import { Switch } from '@shared/components/ui/switch';
import { ScrollArea } from '@shared/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group';
import { Separator as UISeparator } from '@shared/components/ui/separator';

import {
  Form as UIForm,
  FormField as UIFormField,
  FormItem as UIFormItem,
  FormLabel as UIFormLabel,
  FormDescription as UIFormDescription,
  FormMessage as UIFormMessage,
  FormControl as UIFormControl,
} from '@shared/components/ui/form';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';

import {
  Select as UISelect,
  SelectTrigger as UISelectTrigger,
  SelectContent as UISelectContent,
  SelectItem as UISelectItem,
  SelectValue as UISelectValue,
} from '@shared/components/ui/select';

import {
  Command as UICommand,
  CommandEmpty as UICommandEmpty,
  CommandGroup as UICommandGroup,
  CommandItem as UICommandItem,
  CommandList as UICommandList,
} from '@shared/components/ui/command';

import {
  Popover as UIPopover,
  PopoverTrigger as UIPopoverTrigger,
  PopoverContent as UIPopoverContent,
} from '@shared/components/ui/popover';

import {
  Tooltip as UITooltip,
  TooltipTrigger as UITooltipTrigger,
  TooltipContent as UITooltipContent,
} from '@shared/components/ui/tooltip';

import {
  Alert as UIAlert,
  AlertTitle as UIAlertTitle,
  AlertDescription as UIAlertDescription,
} from '@shared/components/ui/alert';

import {
  HoverCard as UIHoverCard,
  HoverCardTrigger as UIHoverCardTrigger,
  HoverCardContent as UIHoverCardContent,
} from '@shared/components/ui/hover-card';

export function AppCommon({ children }: { children: React.ReactNode }) {
  return (
    <ProviderAppCommon
      components={{
        Checkbox: ({
          checked,
          indeterminate,
          disabled,
          onChange,
          className,
          ...rest
        }) => (
          <Checkbox
            checked={indeterminate ? 'indeterminate' : checked}
            // @ts-ignore
            onCheckedChange={(checked: CheckedState) => {
              const next =
                checked === 'indeterminate' ? true : Boolean(checked);
              onChange?.(
                next,
                {} as unknown as React.ChangeEvent<HTMLInputElement>
              );
            }}
            disabled={disabled}
            className={className}
            {...rest}
          />
        ),

        Button: Button as any,
        ScrollArea: ScrollArea as any,

        Dropdown: {
          Root: DropdownMenu,
          Trigger: DropdownMenuTrigger,
          Content: DropdownMenuContent,
          Item: DropdownMenuItem,
          Separator: DropdownMenuSeparator,
        } as unknown as DropdownMenuLike,

        Input: Input as any,
        Textarea: Textarea as any,
        Label: Label as any,
        Switch: Switch as any,
        Badge: Badge as any,

        RadioGroup: {
          Root: RadioGroup as any,
          Item: RadioGroupItem as any,
        },

        Form: {
          Root: UIForm as any,
          Field: UIFormField as any,
          Item: UIFormItem as any,
          Label: UIFormLabel as any,
          Description: UIFormDescription as any,
          Message: UIFormMessage as any,
          Control: UIFormControl as any,
        },

        // @ts-ignore
        Select: {
          Root: UISelect as any,
          Trigger: UISelectTrigger as any,
          Content: UISelectContent as any,
          Item: UISelectItem as any,
          Value: UISelectValue as any,
          
        },

        Command: {
          Root: UICommand as any,
          Empty: UICommandEmpty as any,
          Group: UICommandGroup as any,
          Item: UICommandItem as any,
          List: UICommandList as any,
        },

        Popover: {
          Root: UIPopover as any,
          Trigger: UIPopoverTrigger as any,
          Content: UIPopoverContent as any,
        },

        Tooltip: {
          Root: UITooltip as any,
          Trigger: UITooltipTrigger as any,
          Content: UITooltipContent as any,
        },

        Alert: {
          Root: UIAlert as any,
          Title: UIAlertTitle as any,
          Description: UIAlertDescription as any,
        },

        Separator: UISeparator as any,

        HoverCard: {
          Root: UIHoverCard as any,
          Trigger: UIHoverCardTrigger as any,
          Content: UIHoverCardContent as any,
        },

        Skeleton: Skeleton,
      }}
    >
      {children}
    </ProviderAppCommon>
  );
}
