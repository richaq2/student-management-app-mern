import React, { useState } from "react";
import EditModal from "./EditModal";

const Table = ({ data, columns, model, onDelete, setDataUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  // Function to handle the Edit button click
  const handleEditClick = (item) => {
    setCurrentRowData(item);
    setIsModalOpen(true);
  };

  // Function to handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRowData(null);
    setDataUpdated(true);
  };

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    const day = date.getDate().toString().padStart(2, "0"); // Pad day with leading zero
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of year
    return `${day}/${month}/${year}`;
  };
  return (
    <>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-4 py-2 border-b font-semibold"
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </th>
            ))}
            <th className="text-left px-4 py-2 border-b font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 border-b">
                  {typeof item[col] === "boolean"
                    ? item[col]
                      ? "Yes"
                      : "No"
                    : col === "DOB"
                    ? formatDate(item[col])
                    : item[col] || "N/A"}
                </td>
              ))}
              <td className="px-4 py-2 border-b">
                <button
                  onClick={() => handleEditClick(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Render the Modal */}
      {isModalOpen && (
        <EditModal
          data={currentRowData}
          columns={columns}
          onClose={handleCloseModal}
          model={model}
        />
      )}
    </>
  );
};

export default Table;
