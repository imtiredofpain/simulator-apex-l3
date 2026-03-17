"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@shared/lib/utils";
import { interpolateColor } from "@mrdn/app-common";

type TProgressInterpolated = "yes" | "no" | "inverse";

function getInterpolatedValue(
  value?: number | null,
  interpolated?: TProgressInterpolated
) {
  if (value == undefined || interpolated == null) return undefined;
  if (interpolated === "yes") {
    return interpolateColor(value / 100);
  } else if (interpolated === "inverse") {
    return interpolateColor(value / 100, "#03e100", "#ffbe25", "#ff0000");
  }
  return undefined;
}

function Progress({
  className,
  value,
  interpolated,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  interpolated?: TProgressInterpolated;
}) {
  const color = getInterpolatedValue(value, interpolated);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-blue-400 h-full w-full flex-1 transition-all rounded-full"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: color,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
