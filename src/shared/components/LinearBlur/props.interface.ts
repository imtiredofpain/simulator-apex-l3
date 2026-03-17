export interface LinearBlurProps {
  color?: string,
  className?: string,
  style?: React.CSSProperties;
  blur?: 0 | 1 | 2 | 4 | 8 | 16| 32 | 64;
  rotate?: number;
}