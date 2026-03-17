import type {
  GroupHeader,
  ButtonHeader,
  SeparatorHeader,
  ButtonHeaderClickable,
  ButtonHeaderComponent,
} from '@shared/navigation/types';
import type { HeaderItem } from './types';

export const isGroup = (i: HeaderItem): i is GroupHeader => {
  return (
    (i as GroupHeader).children !== undefined &&
    Array.isArray((i as GroupHeader).children)
  );
};

export const isButton = (i: HeaderItem): i is ButtonHeader => {
  return (
    typeof (i as ButtonHeaderClickable).onClick === 'function' ||
    (i as ButtonHeaderComponent).component !== undefined
  );
};

export const isSeparator = (i: HeaderItem): i is SeparatorHeader => {
  return !isGroup(i) && !isButton(i);
};
