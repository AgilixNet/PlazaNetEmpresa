import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos',
  emptyIcon: EmptyIcon = null,
  onRowClick = null,
  actions = null,
  searchTerm = '',
  sortBy = null,
  sortOrder = 'asc'
}) {
  const [sort, setSort] = useState({ by: sortBy, order: sortOrder });

  const handleSort = (columnKey) => {
    if (sort.by === columnKey) {
      setSort({
        by: columnKey,
        order: sort.order === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSort({ by: columnKey, order: 'asc' });
    }
  };

  // Filtrar datos basado en búsqueda
  let filteredData = data;
  if (searchTerm && columns.some(col => col.searchable)) {
    filteredData = data.filter(row => {
      return columns.some(col => {
        if (!col.searchable) return false;
        const value = row[col.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }

  // Ordenar datos
  if (sort.by) {
    filteredData = [...filteredData].sort((a, b) => {
      const aValue = a[sort.by];
      const bValue = b[sort.by];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date) {
        comparison = aValue - bValue;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && sort.by === column.key && (
                      sort.order === 'asc' 
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`hover:bg-gray-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4">
                    {column.render
                      ? column.render(row[column.key], row)
                      : formatValue(row[column.key], column.type)
                    }
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          {EmptyIcon && <EmptyIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />}
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

function formatValue(value, type) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">-</span>;
  }

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value);
    
    case 'date':
      return new Date(value).toLocaleDateString('es-CO');
    
    case 'datetime':
      return new Date(value).toLocaleString('es-CO');
    
    case 'boolean':
      return value ? (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
          Sí
        </span>
      ) : (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
          No
        </span>
      );
    
    case 'badge':
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          {value}
        </span>
      );
    
    default:
      return value;
  }
}