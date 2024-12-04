// src/pages/FinancialAnalytics.js

import React, { useState, useEffect } from 'react';
import {
  fetchAvailableYears,
  fetchAvailableMonths,
  fetchFinancialAnalytics,
} from '../api'; // Adjust the path if your api.js is located elsewhere
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialAnalytics = () => {
  const [view, setView] = useState('yearly'); // 'monthly' or 'yearly'
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Get current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // Fetch available years on component mount
  useEffect(() => {
    const getAvailableYears = async () => {
      setLoadingYears(true);
      try {
        const result = await fetchAvailableYears();
        setAvailableYears(result.years);
        // Set year to current year if available, else first available year
        if (result.years.length > 0) {
          if (result.years.includes(currentYear)) {
            setYear(currentYear);
          } else {
            setYear(result.years[0]);
          }
        }
        setLoadingYears(false);
      } catch (error) {
        console.error('Error fetching available years:', error);
        setError(error.message);
        setLoadingYears(false);
      }
    };

    getAvailableYears();
  }, [currentYear]);

  // Fetch available months when year or view changes
  useEffect(() => {
    if (year && view === 'monthly') {
      const getAvailableMonths = async () => {
        setLoadingMonths(true);
        try {
          const result = await fetchAvailableMonths(year);
          setAvailableMonths(result.months);
          // Set month to current month if available, else first available month
          if (result.months.length > 0) {
            if (result.months.includes(currentMonth)) {
              setMonth(currentMonth);
            } else {
              setMonth(result.months[0]);
            }
          }
          setLoadingMonths(false);
        } catch (error) {
          console.error('Error fetching available months:', error);
          setError(error.message);
          setLoadingMonths(false);
        }
      };

      getAvailableMonths();
    } else {
      setAvailableMonths([]);
      setMonth('');
    }
  }, [year, view, currentMonth]);

  // Fetch financial data when view, year, or month changes
  useEffect(() => {
    const getFinancialData = async () => {
      if (!year || (view === 'monthly' && !month)) {
        setData(null);
        return;
      }
      setLoadingData(true);
      try {
        const fetchedData = await fetchFinancialAnalytics(view, year, month);
        setData(fetchedData);
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setError(error.message);
        setLoadingData(false);
      }
    };

    getFinancialData();
  }, [view, year, month]);

  const handleViewChange = (e) => {
    setView(e.target.value);
    setData(null); // Reset data when view changes
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
    setData(null); // Reset data when year changes
  };

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
    setData(null); // Reset data when month changes
  };

  // Prepare data for the bar chart
  const barChartData = {
    labels: ['Expenses (INR)', 'Income (INR)'],
    datasets: [
      {
        label:
          view === 'monthly'
            ? `Financial Data for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })}/${year}`
            : `Financial Data for ${year}`,
        data: data ? [data.expenses, data.income] : [0, 0],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters */}
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">View:</label>
        <select
          value={view}
          onChange={handleViewChange}
          className="border px-3 py-2 rounded mr-4"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <label className="mr-2 font-semibold">Year:</label>
        {loadingYears ? (
          <p>Loading years...</p>
        ) : (
          <select
            value={year}
            onChange={handleYearChange}
            className="border px-3 py-2 rounded mr-4"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        {view === 'monthly' && (
          <>
            <label className="mr-2 font-semibold">Month:</label>
            {loadingMonths ? (
              <p>Loading months...</p>
            ) : (
              <select
                value={month}
                onChange={handleMonthChange}
                className="border px-3 py-2 rounded"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {/* Loading Indicator */}
      {loadingData && <p>Loading financial data...</p>}

      {/* Financial Details */}
      {data && (
        <div className="flex items-center mb-6">
          <h3 className="text-xl font-semibold mr-4">Details:</h3>
          <p className="mr-4">Expenses: INR {data.expenses.toLocaleString()}</p>
          <p className="mr-4">Income: INR {data.income.toLocaleString()}</p>
          <p>Unpaid Fees: INR {data.unpaidFees.toLocaleString()}</p>
        </div>
      )}

      {/* Bar Chart */}
      {data && (
        <div className="mb-6">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text:
                    view === 'monthly'
                      ? `Financial Data for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })}/${year}`
                      : `Financial Data for ${year}`,
                },
              },
            }}
          />
        </div>
      )}

      {/* Optional Pie Chart (Commented Out) */}
      {/* {data && (
        <div className="mb-6">
          <Pie data={pieChartData} />
        </div>
      )} */}
    </div>
  );
}
export default FinancialAnalytics;
