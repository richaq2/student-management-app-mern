// FinancialAnalytics.js

import React, { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
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
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinancialAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch financial data
    const fetchFinancialData = async () => {
      try {
        const result = await fetchData('analytics/financial');
        setData(result);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  if (!data) return <p>Loading financial data...</p>;

  const chartData = {
    labels: ['Expenses (INR)', 'Income (INR)'],
    datasets: [
      {
        label: 'Financial Data',
        data: [data.expenses, data.income],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-semibold mr-4">Details:</h3>
        <p className="mr-4">Expenses: INR {data.expenses.toLocaleString()}</p>
        <p>Income: INR {data.income.toLocaleString()}</p>
      </div>
      <div className="mb-6">
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default FinancialAnalytics;
