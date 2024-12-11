
import React, { useEffect, useState } from 'react';
import { fetchData } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFinancial, setLoadingFinancial] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const getStats = async () => {
      try {
        const statsData = await fetchData('stats');
        setStats(statsData);

        // Fetch financial analytics data
        const financialResponse = await fetchData(
          'analytics/financial?view=yearly&year=2024'
        );
        setFinancialData(financialResponse);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStats(false);
        setLoadingFinancial(false);
      }
    };

    getStats();
  }, []);

  const financialChartData = {
    labels: ['Income', 'Expenses', 'Unpaid Fees'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: financialData
          ? [financialData.income, financialData.expenses, financialData.unpaidFees]
          : [0, 0, 0],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome back, {user?.name || 'Admin'}!
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
        <div className="flex flex-wrap">
          <Link
            to="/manage/students"
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4 mb-4 hover:bg-blue-600"
          >
            Add Student
          </Link>
          <Link
            to="/manage/teachers"
            className="bg-green-500 text-white px-4 py-2 rounded mr-4 mb-4 hover:bg-green-600"
          >
            Add Teacher
          </Link>
          <Link
            to="/manage/classes"
            className="bg-purple-500 text-white px-4 py-2 rounded mr-4 mb-4 hover:bg-purple-600"
          >
            Add Class
          </Link>
          <Link
            to="/analytics/financial"
            className="bg-teal-500 text-white px-4 py-2 rounded mr-4 mb-4 hover:bg-teal-600"
          >
            View Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {loadingStats ? (
          Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-6 rounded-lg shadow-md bg-white flex items-center">
                <div className="rounded-full h-12 w-12 bg-gray-300"></div>
                <div className="ml-4">
                  <Skeleton height={20} width={100} />
                  <Skeleton height={25} width={50} />
                </div>
              </div>
          ))
        ) : (stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-lg shadow-md bg-white flex items-center"
          >
            <div
              className={`rounded-full h-12 w-12 flex items-center justify-center ${stat.color}`}
            >
              {stat.icon && <i className={`${stat.icon} text-white text-2xl`}></i>}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">{stat.title}</h2>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
          </div>
        ))
      )}
      </div>

      {/* Financial Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Financial Overview</h2>
        {loadingFinancial ? (
            <Skeleton height={200} />
        ) : financialData ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Bar
              data={financialChartData}
              options={{
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        ) : (
          <p>No financial data available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
