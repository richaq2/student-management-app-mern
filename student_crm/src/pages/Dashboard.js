// src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import { fetchData } from '../api';
import { useAuth } from '../contexts/AuthContext';
import FinancialAnalytics from './FinancialAnalytics';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchData('stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    getStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded shadow-md ${stat.color} text-white`}
          >
            <h2 className="text-xl font-semibold">{stat.title}</h2>
            <p className="text-2xl">{stat.count}</p>
          </div>
        ))}
      </div>
      <FinancialAnalytics/>
    </div>
  );
};

export default Dashboard;
