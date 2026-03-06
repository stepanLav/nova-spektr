/**
 * Table — shadcn/ui component
 * Replaces: shared/ui-kit/Table/Table.tsx
 *
 * API:
 *   - Table (compound component) with columns/data props + sorting
 *   - Shadcn-style: TableRoot, TableHeader, TableBody, TableRow,
 *     TableHead, TableCell, TableCaption, TableFooter
 */
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  forwardRef,
  isValidElement,
  memo,
  useMemo,
  useState,
} from 'react';

import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export type Column<T> = {
  key: keyof T;
  title: ReactNode;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
};

const CELL_ALIGN_STYLES = {
  top: 'align-top',
  middle: 'align-middle',
  bottom: 'align-bottom',
} as const;

export type CellAlign = keyof typeof CELL_ALIGN_STYLES;

// ─── Compound Table (Nova Spektr API) ─────────────────────────────────────────

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  cellAlign?: CellAlign;
  onSort?: (key: keyof T, direction: SortDirection) => void;
};

const TableComponent = <T,>({ columns, data, className, cellAlign = 'middle', onSort }: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: keyof T) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    let newDirection: SortDirection = 'asc';
    if (sortKey === key && sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortKey === key && sortDirection === 'desc') {
      newDirection = null;
      setSortKey(null);
    } else {
      setSortKey(key);
    }

    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      let comparison: number;

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full caption-bottom text-footnote">
        <thead className="border-b border-divider">
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 text-left font-medium text-text-secondary',
                  {
                    'cursor-pointer select-none hover:text-text-primary': column.sortable,
                    'text-text-primary': sortKey === column.key && sortDirection,
                  },
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {isValidElement(column.title) ? column.title : <span>{column.title}</span>}
                  {column.sortable && (
                    <span className="text-xs">
                      {sortKey === column.key && sortDirection === 'asc' && '↑'}
                      {sortKey === column.key && sortDirection === 'desc' && '↓'}
                      {sortKey !== column.key && <span className="opacity-30">↑</span>}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {sortedData.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={index} className="transition-colors hover:bg-block-background-hover">
              {columns.map(column => (
                <td key={String(column.key)} className={cn('px-4 py-3 text-text-primary', CELL_ALIGN_STYLES[cellAlign])}>
                  {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Table = memo(TableComponent) as typeof TableComponent;

// ─── Shadcn-style primitive exports ──────────────────────────────────────────

export const TableRoot = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<'table'>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-footnote', className)} {...props} />
    </div>
  ),
);
TableRoot.displayName = 'TableRoot';

export const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b border-divider [&_tr]:border-b', className)} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-divider [&_tr:last-child]:border-0', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tfoot'>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t border-divider bg-block-background-hover font-medium', className)}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b border-divider transition-colors hover:bg-block-background-hover', className)}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<
  ElementRef<'th'>,
  ComponentPropsWithoutRef<'th'>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-text-secondary',
      '[&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
  ElementRef<'td'>,
  ComponentPropsWithoutRef<'td'>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-text-primary [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<
  ElementRef<'caption'>,
  ComponentPropsWithoutRef<'caption'>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-footnote text-text-secondary', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';
