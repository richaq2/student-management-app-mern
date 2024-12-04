import React, { useState } from "react";
import EditModal from "./EditModal";
import { useNavigate } from "react-router-dom";
import { deleteData } from "../api";

const Table = ({ data, columns, model, setDataUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleRowClick = (item) => {
    if (model === "classes") {
      navigate(`/classes/${item._id}`);
    }
  };

  const handleEditClick = (item) => {
    setCurrentRowData(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (item) => {
    await deleteData(model, item._id);
    setDataUpdated(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRowData(null);
    setDataUpdated(true);
  };

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
        return value
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
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
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === "string") {
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
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
    let direction = "asc";
    if (sortConfig.key === col && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: col, direction });
  };

  return (
    <>
      <div className="mb-4 flex justify-center items-center ml-4">
        <div className="relative w-mid">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border px-4 py-2 rounded w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute top-0 left-0 mt-2 ml-3 text-gray-500">
            <i className="fa fa-search"></i>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-center px-4 py-2 border-b font-semibold cursor-pointer select-none"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center justify-center">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {sortConfig.key === col ? (
                      sortConfig.direction === "asc" ? (
                        <i className="fa fa-sort-asc ml-2"></i>
                      ) : (
                        <i className="fa fa-sort-desc ml-2"></i>
                      )
                    ) : (
                      <i className="fa fa-sort ml-2 text-gray-400"></i>
                    )}
                  </div>
                </th>
              ))}
              <th className="text-center px-4 py-2 border-b font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="hover:bg-gray-100 transition duration-300"
                >
                  {columns.map((col) => (
                    <td key={col} className="text-center px-4 py-2 border-b">
                      {typeof item[col] === "boolean"
                        ? item[col]
                          ? "Yes"
                          : "No"
                        : col === "DOB" || col.toLowerCase().includes("date")
                        ? formatDate(item[col])
                        : col === "existingStudents"
                        ? item.students
                          ? item.students.length
                          : 0
                        : item[col] || "N/A"}
                    </td>
                  ))}
                  <td className="text-center px-4 py-2 border-b">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300"
                        title="Edit"
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                      </button>

                      {model === "classes" && (
                        <button
                          onClick={() => handleRowClick(item)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300"
                          title="View"
                        >
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
                        title="Delete"
                      >
                        <i className="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center px-4 py-6 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex shadow-sm">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-l-md hover:bg-gray-100 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border hover:bg-gray-100 disabled:opacity-50"
            >
              <i class="fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <span className="px-3 py-1 border-t border-b bg-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border hover:bg-gray-100 disabled:opacity-50"
            >
              <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-r-md hover:bg-gray-100 disabled:opacity-50"
            >
              Last
            </button>
          </nav>
        </div>
      )}

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
