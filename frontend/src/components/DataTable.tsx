import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export default function DataTable<T>({ columns, rows, loading, error, emptyMessage = "No records found." }: DataTableProps<T>) {
  if (loading) {
    return <div className="data-table-state">Loading...</div>;
  }

  if (error) {
    return <div className="data-table-state error">{error}</div>;
  }

  if (!rows.length) {
    return <div className="data-table-state">{emptyMessage}</div>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => {
                const rawValue = column.render
                  ? column.render(row, rowIndex)
                  : (row as Record<string, unknown>)[String(column.key)];
                const cellValue: ReactNode = rawValue == null ? "-" : (rawValue as ReactNode);
                return <td key={`${String(column.key)}-${rowIndex}`}>{cellValue}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
