// src/components/Table.js

import React, { useState } from "react";
import EditModal from "./EditModal";
import { useNavigate } from "react-router-dom";
import { deleteData } from "../api";

const Table = ({ data, columns, model, setDataUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number as needed

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleRowClick = (item) => {
    if (model === "classes") {
      navigate(`/classes/${item._id}`);
    }
  };

  // Function to handle the Edit button click
  const handleEditClick = (item) => {
    setCurrentRowData(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    deleteData(model, item._id);
    setDataUpdated(true);
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

  // Filtered and sorted data
  const filteredData = data.filter((item) =>
    columns.some((col) => {
      const value = item[col];
      if (value) {
        return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    })
  );

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSort = (col) => {
    let direction = 'asc';
    if (sortConfig.key === col && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: col, direction });
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border px-4 py-2 rounded w-full"
        />
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-center px-4 py-2 border-b font-semibold cursor-pointer"
                onClick={() => handleSort(col)}
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sortConfig.key === col ? (
                  sortConfig.direction === 'asc' ? (
                    <span> ▲</span>
                  ) : (
                    <span> ▼</span>
                  )
                ) : (
                  ''
                )}
              </th>
            ))}
            <th className="text-center px-4 py-2 border-b font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, idx) => (
            <tr key={item._id || idx}>
              {columns.map((col) => (
                <td key={col} className="text-center px-4 py-2 border-b">
                  {typeof item[col] === "boolean"
                    ? item[col]
                      ? "Yes"
                      : "No"
                    : col === "DOB"
                    ? formatDate(item[col])
                    : col === "existingStudents"
                    ? item.students
                      ? item.students.length
                      : 0
                    : item[col] || "N/A"}
                </td>
              ))}
              <td className="text-center px-4 py-2 border-b">
                <button
                  onClick={() => handleEditClick(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit{" "}
                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                </button>

                {/* Render the View button only when model is 'classes' */}
                {model === "classes" && (
                  <button
                    onClick={() => handleRowClick(item)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                  >
                    View <i className="fa fa-bar-chart" aria-hidden="true"></i>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteClick(item)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  <i className="fa fa-trash-o" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 mx-1 border rounded disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 mx-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-2 py-1 mx-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 mx-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 mx-1 border rounded disabled:opacity-50"
        >
          Last
        </button>
      </div>

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
