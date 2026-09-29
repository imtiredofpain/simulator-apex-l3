import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, RotateCcw } from 'lucide-react';
import type { LineDto } from '@features/Lines/types';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';
import { Button } from '@shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import type { AdminJobStatus } from '../types';

const ALL_STATUSES = '__all__';

interface AdminJobListFiltersProps {
  lines: LineDto[];
  statuses: EnumsUnits<{ color: string }>;
  status?: AdminJobStatus;
  lineIds: number[];
  hasActiveFilters: boolean;
  isLoadingLines?: boolean;
  onStatusChange: (status?: AdminJobStatus) => void;
  onLineIdsChange: (lineIds: number[]) => void;
  onReset: () => void;
}

function lineLabel(line: LineDto) {
  return line.lineNumber ? `${line.name} (${line.lineNumber})` : line.name;
}

export function AdminJobListFilters({
  lines,
  statuses,
  status,
  lineIds,
  hasActiveFilters,
  isLoadingLines = false,
  onStatusChange,
  onLineIdsChange,
  onReset,
}: AdminJobListFiltersProps) {
  const [linesOpen, setLinesOpen] = useState(false);
  const statusOptions = useMemo(
    () =>
      Object.entries(statuses).sort(
        ([left], [right]) => Number(left) - Number(right)
      ),
    [statuses]
  );
  const selectedLines = useMemo(
    () => lines.filter((line) => lineIds.includes(Number(line.id))),
    [lineIds, lines]
  );
  const lineSummary =
    selectedLines.length === 0
      ? 'Все линии'
      : selectedLines.length === 1
        ? lineLabel(selectedLines[0])
        : `Выбрано линий: ${selectedLines.length}`;

  const toggleLine = (lineId: number) => {
    onLineIdsChange(
      lineIds.includes(lineId)
        ? lineIds.filter((id) => id !== lineId)
        : [...lineIds, lineId].sort((left, right) => left - right)
    );
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Select
        value={status === undefined ? ALL_STATUSES : String(status)}
        onValueChange={(value) =>
          onStatusChange(value === ALL_STATUSES ? undefined : Number(value))
        }
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>Все статусы</SelectItem>
          {statusOptions.map(([value, option]) => (
            <SelectItem key={value} value={value}>
              {option.description || option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={linesOpen} onOpenChange={setLinesOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={linesOpen}
            disabled={isLoadingLines}
            className="w-[260px] justify-between font-normal"
          >
            <span className="truncate">
              {isLoadingLines ? 'Загрузка линий…' : lineSummary}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder="Номер или название линии…" />
            <CommandList>
              <CommandEmpty>Линии не найдены.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="Все линии"
                  onSelect={() => onLineIdsChange([])}
                >
                  <Check
                    className={
                      lineIds.length === 0 ? 'opacity-100' : 'opacity-0'
                    }
                  />
                  Все линии
                </CommandItem>
                {lines.map((line) => {
                  const id = Number(line.id);
                  const selected = lineIds.includes(id);

                  return (
                    <CommandItem
                      key={line.id}
                      value={`${line.name} ${line.lineNumber} ${line.id}`}
                      onSelect={() => toggleLine(id)}
                    >
                      <Check
                        className={selected ? 'opacity-100' : 'opacity-0'}
                      />
                      <span className="truncate">{lineLabel(line)}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!hasActiveFilters}
        onClick={onReset}
      >
        <RotateCcw />
        Сбросить фильтры
      </Button>
    </div>
  );
}
