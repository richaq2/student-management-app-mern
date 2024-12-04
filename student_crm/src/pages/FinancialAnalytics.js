import React, { useState, useEffect } from 'react';
import {
  fetchAvailableYears,
  fetchAvailableMonths,
  fetchFinancialAnalytics,
} from '../api';
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
  const currentMonth = currentDate.getMonth() + 1; 


  useEffect(() => {
    const getAvailableYears = async () => {
      setLoadingYears(true);
      try {
        const result = await fetchAvailableYears();
        setAvailableYears(result.years);
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

  useEffect(() => {
    if (year && view === 'monthly') {
      const getAvailableMonths = async () => {
        setLoadingMonths(true);
        try {
          const result = await fetchAvailableMonths(year);
          setAvailableMonths(result.months);
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
    setData(null); 
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
    setData(null); 
  };

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
    setData(null); 
  };

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Financial Analytics</h2>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="mb-4 md:mb-0">
            <label className="block text-gray-700 font-semibold mb-2">View</label>
            <select
              value={view}
              onChange={handleViewChange}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="mb-4 md:mb-0">
            <label className="block text-gray-700 font-semibold mb-2">Year</label>
            {loadingYears ? (
              <div className="text-gray-500">Loading years...</div>
            ) : (
              <select
                value={year}
                onChange={handleYearChange}
                className="border px-3 py-2 rounded w-full"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>

          {view === 'monthly' && (
            <div className="mb-4 md:mb-0">
              <label className="block text-gray-700 font-semibold mb-2">Month</label>
              {loadingMonths ? (
                <div className="text-gray-500">Loading months...</div>
              ) : (
                <select
                  value={month}
                  onChange={handleMonthChange}
                  className="border px-3 py-2 rounded w-full"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {loadingData && (
        <div className="flex justify-center items-center mb-6">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          <p className="ml-4 text-gray-700">Loading financial data...</p>
        </div>
      )}

      {data && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="bg-red-500 text-white p-4 rounded-full">
                <i className="fa fa-line-chart text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Expenses</p>
                <p className="text-xl font-bold text-gray-800">INR {data.expenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-500 text-white p-4 rounded-full">
              <i class="fa fa-handshake-o text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Income</p>
                <p className="text-xl font-bold text-gray-800">INR {data.income.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-yellow-500 text-white p-4 rounded-full">
                <i className="fa fa-exclamation-circle text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Unpaid Fees</p>
                <p className="text-xl font-bold text-gray-800">INR {data.unpaidFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {data && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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
                      ? `Financial Data for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
                      : `Financial Data for ${year}`,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default FinancialAnalytics;
