interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  emptyMessage = 'Aucun résultat',
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-th">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    <div className="skeleton h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12 text-neutral-400">
        <p className="text-lg mb-1">📭</p>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`table-th ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`table-td ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
