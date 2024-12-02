import React from 'react';

const Table = ({ data, columns }) => {
  return (
    <table className="min-w-full bg-white shadow rounded">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="text-left px-4 py-2 border-b font-semibold">
              {col.charAt(0).toUpperCase() + col.slice(1)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col} className="px-4 py-2 border-b">
                {typeof item[col] === 'boolean'
                  ? item[col]
                    ? 'Yes'
                    : 'No'
                  : item[col] || 'N/A'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
