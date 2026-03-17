import type { LinearBlurProps } from './props.interface';
import Style from './style.module.css';
import {
  selectEnabled,
  usePowerSavingStore,
} from '@shared/processes/power-saving/model/store';
import { useTheme } from '@features/Settings/providers/theme';

function LinearBlur({
  color,
  className,
  style,
  blur = 64,
  rotate = 0,
}: LinearBlurProps) {
  const { theme } = useTheme();
  const powerSaving = usePowerSavingStore(selectEnabled);
  const blurValue = powerSaving ? 0 : blur;
  const tColor = color ? color : theme === 'dark' ? '#0a0a0a' : '#fff';
  return (
    <div
      className={[Style.container, className].join(' ')}
      style={{
        ...style,
        backgroundImage: `linear-gradient(${
          rotate - 180
        }deg, rgba(0, 0, 0, 0) 0%, ${tColor} 100%)`,
      }}
    >
      <div className={Style.wrapper}>
        <div
          className={Style.blur}
          style={{
            zIndex: 1,
            mask: `linear-gradient(${rotate}deg, #000 0%, rgba(0, 0, 0, 0) 12.5%)`,
            backdropFilter: `blur(${blurValue > 64 ? 64 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 64 ? 64 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, #000 0%, rgba(0, 0, 0, 0) 12.5%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 2,
            mask: `linear-gradient(${rotate}deg, #000 0%, #000 12.5%, rgba(0, 0, 0, 0) 25%)`,
            backdropFilter: `blur(${blurValue > 32 ? 32 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 32 ? 32 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, #000 0%, #000 12.5%, rgba(0, 0, 0, 0) 25%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 3,
            mask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 0%, #000 12.5%, #000 25%, rgba(0, 0, 0, 0) 37.5%)`,
            backdropFilter: `blur(${blurValue > 16 ? 16 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 16 ? 16 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 0%, #000 12.5%, #000 25%, rgba(0, 0, 0, 0) 37.5%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 4,
            mask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 12.5%, #000 25%, #000 37.5%, rgba(0, 0, 0, 0) 50%)`,
            backdropFilter: `blur(${blurValue > 8 ? 8 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 8 ? 8 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 12.5%, #000 25%, #000 37.5%, rgba(0, 0, 0, 0) 50%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 5,
            mask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 25%, #000 37.5%, #000 50%, rgba(0, 0, 0, 0) 62.5%)`,
            backdropFilter: `blur(${blurValue > 4 ? 4 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 4 ? 4 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 25%, #000 37.5%, #000 50%, rgba(0, 0, 0, 0) 62.5%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 5,
            mask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 37.5%, #000 50%, #000 62.5%, rgba(0, 0, 0, 0) 75%)`,
            backdropFilter: `blur(${blurValue > 2 ? 2 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 2 ? 2 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 37.5%, #000 50%, #000 62.5%, rgba(0, 0, 0, 0) 75%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 6,
            mask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 50%, #000 62.5%, #000 75%, rgba(0, 0, 0, 0) 87.5%)`,
            backdropFilter: `blur(${blurValue > 1 ? 1 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 1 ? 1 : blurValue}px)`,
            WebkitMask: `linear-gradient(${rotate}deg, rgba(0, 0, 0, 0) 50%, #000 62.5%, #000 75%, rgba(0, 0, 0, 0) 87.5%)`,
          }}
        ></div>
        <div
          className={Style.blur}
          style={{
            zIndex: 7,
            mask: `linear-gradient(
                     ${rotate}deg,
                     rgba(0, 0, 0, 0) 62.5%,
                     #000 75%,
                     #000 87.5%,
                     rgba(0, 0, 0, 0) 100%
                   )`,
            backdropFilter: `blur(${blurValue > 0 ? 0.5 : blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue > 0 ? 0.5 : blurValue}px)`,
            WebkitMask: `linear-gradient(
                     ${rotate}deg,
                     rgba(0, 0, 0, 0) 62.5%,
                     #000 75%,
                     #000 87.5%,
                     rgba(0, 0, 0, 0) 100%
                   )`,
          }}
        ></div>
      </div>
      <div
        className={Style.gradient}
        style={{
          backgroundImage: `linear-gradient(${
            rotate - 180
          }deg, rgba(0, 0, 0, 0) 0%, ${tColor} 98%)`,
        }}
      ></div>
    </div>
  );
}

export { LinearBlur };
