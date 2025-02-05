import { PropsWithChildren, useCallback, useMemo, useState } from 'react';

import cnTw from '@renderer/shared/utils/twMerge';
import { SortConfig, SortType, AnyRecord, IndexKey, ColumnConfig } from './common/types';
import { getUpdatedConfig, getSortedData } from './common/utils';
import { TableBody, TableCell, TableColumn, TableHeader, TableRow } from './TableParts';
import { TableContext } from './TableContext';

type Props<T extends AnyRecord> = {
  by: IndexKey;
  dataSource: T[];
  loading?: boolean;
  className?: string;
  selectedKeys?: IndexKey[];
  onSelect?: (keys: IndexKey[]) => void;
};

// TODO: think about nice TS support
// type TableComposition = {
//   Header: Parameters<typeof TableHeader>;
//   Column: Parameters<typeof TableColumn>;
//   Body: Parameters<typeof TableBody>;
//   Row: Parameters<typeof TableRow>;
//   Cell: Parameters<typeof TableCell>;
// };

const Table = <T extends AnyRecord>({
  by,
  dataSource,
  loading,
  className,
  selectedKeys,
  onSelect,
  children,
}: PropsWithChildren<Props<T>>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({});
  const [excludedKeys, setExcludedKeys] = useState<IndexKey[]>([]);

  const allRowsSelected = dataSource.length - excludedKeys.length === selectedKeys?.length;

  const addSortingConfig = useCallback(
    ({ dataKey, align, sortable, sortType }: ColumnConfig) => {
      const payload = {
        dataKey,
        align,
        sortable,
        sortType: sortType || SortType.NONE,
      };

      setSortConfig((prev) => ({ ...prev, [dataKey]: payload }));
    },
    [setSortConfig],
  );

  const updateSortingOrder = useCallback(
    (column: string) => {
      if (sortConfig[column]) {
        setSortConfig((prev) => getUpdatedConfig(column, prev));
      } else {
        console.warn(`${column} is absent`);
      }
    },
    [sortConfig, setSortConfig],
  );

  const excludeKey = useCallback(
    (key: IndexKey) => {
      setExcludedKeys((prev) => prev.concat(key));
    },
    [setExcludedKeys],
  );

  const selectAll = useCallback(() => {
    if (!selectedKeys || !onSelect) return;

    if (allRowsSelected) {
      onSelect?.([]);
    } else {
      const allSelectedKeys = dataSource.reduce<IndexKey[]>((acc, source) => {
        if (!excludedKeys.includes(source[by])) {
          acc.push(source[by]);
        }

        return acc;
      }, []);

      onSelect(allSelectedKeys);
    }
  }, [dataSource, excludedKeys, allRowsSelected, onSelect]);

  const selectRow = useCallback(
    (key: IndexKey) => {
      if (!selectedKeys || !onSelect) return;

      if (selectedKeys.includes(key)) {
        onSelect(selectedKeys.filter((k) => k !== key));
      } else {
        onSelect(selectedKeys.concat(key));
      }
    },
    [selectedKeys, onSelect],
  );

  const sortedData = useMemo(() => {
    return getSortedData(dataSource, sortConfig);
  }, [dataSource, sortConfig]);

  const value = {
    by,
    dataSource: sortedData,
    loading,
    sortConfig,
    selectedKeys,
    allRowsSelected,
    addSortingConfig,
    updateSortingOrder,
    excludeKey,
    selectAll,
    selectRow,
  };

  return (
    <TableContext.Provider value={value}>
      <table className={cnTw('w-full rounded-2lg table-auto', className)}>{children}</table>
    </TableContext.Provider>
  );
};

Table.Header = TableHeader;
Table.Column = TableColumn;
Table.Body = TableBody;
Table.Cell = TableCell;
Table.Row = TableRow;

export default Table;
