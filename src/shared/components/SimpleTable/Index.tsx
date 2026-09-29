import {
  VirtualTableV2,
  type ColumnDefExt,
  type VirtualTableProps,
} from '@mrdn/app-common';
import NoDataPreloader from './NoDataPreloader';
import { isValidElement } from 'react';

interface SimleTableProps<T> {
  rows: T[];
  columns: ColumnDefExt<T, unknown>[];
  isLoading: boolean;
  hiddenColumns: VirtualTableProps<T>['columnVisibility'];
  renderEmpty?: VirtualTableProps<T>['renderEmpty'];
  valueSearch?: string;
  heightPx?: VirtualTableProps<T>['heightPx'];
  footerToolbar?: React.ReactNode;
}

export function SimleTable<T>(props: SimleTableProps<T>) {
  const {
    rows,
    columns,
    isLoading = false,
    hiddenColumns = { id: false },
    renderEmpty = <NoDataPreloader valueSearch={props.valueSearch} />,
    valueSearch = '',
    heightPx = 600,
    footerToolbar,
  } = props;
  return (
    <VirtualTableV2<T>
      columnVisibility={hiddenColumns}
      data={rows}
      columns={columns}
      showButtonTop
      heightPx={heightPx}
      selectionMode="none"
      isLoading={isLoading}
      footerToolbar={footerToolbar ?? (
        <div className="flex flex-row gap-2 justify-between text-xs text-muted-foreground bg-muted-foreground/4 -m-2 py-2 px-3">
          <div></div>
          <div>Записей: {rows.length}</div>
        </div>
      )}
      className="border rounded-md"
      renderEmpty={() => {
        if (isValidElement(renderEmpty)) {
          return renderEmpty;
        }
        return <NoDataPreloader valueSearch={valueSearch} />;
      }}
    />
  );
}
