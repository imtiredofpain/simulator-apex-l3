'use client';

import React from 'react';

export type CustomRendererProps<TValue, TMeta extends Record<string, unknown>> = {
  id: string;
  value: TValue;
  meta: TMeta | undefined;
  disabled: boolean;
  onChange: (value: TValue) => void;
  i18nKey: string;
  description?: string;
};

export interface CustomRendererEntry<
  TValue,
  TMeta extends Record<string, unknown>,
> {
  key: string;
  Component: React.ComponentType<CustomRendererProps<TValue, TMeta>>;
}

class RendererRegistry {
  private map = new Map<
    string,
    React.ComponentType<CustomRendererProps<unknown, Record<string, unknown>>>
  >();

  register<TValue, TMeta extends Record<string, unknown>>(
    key: string,
    Component: React.ComponentType<CustomRendererProps<TValue, TMeta>>,
  ) {
    this.map.set(
      key,
      Component as React.ComponentType<
        CustomRendererProps<unknown, Record<string, unknown>>
      >,
    );
  }

  get<TValue, TMeta extends Record<string, unknown>>(
    key: string,
  ): React.ComponentType<CustomRendererProps<TValue, TMeta>> | null {
    const C = this.map.get(key);
    return (
      (C as React.ComponentType<CustomRendererProps<TValue, TMeta>>) ?? null
    );
  }
}

export const rendererRegistry = new RendererRegistry();

/** Пример кастомного рендерера: ColorPicker */
type ColorMeta = { preview?: boolean };
export const ColorPicker: React.FC<CustomRendererProps<string, ColorMeta>> = ({
  id,
  value,
  meta,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <input
        id={id}
        type="color"
        className="w-10 h-8 border rounded-md cursor-pointer"
        disabled={disabled}
        value={typeof value === 'string' ? value : '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
      />
      {meta?.preview ? (
        <div
          className="border rounded-md h-7 w-7"
          style={{ background: value }}
        />
      ) : null}
    </div>
  );
};

// Регистрируем по ключу 'ColorPicker'
rendererRegistry.register<string, ColorMeta>('ColorPicker', ColorPicker);
