import React from 'react';

const stats = [
  { title: 'Total Classes', count: 10, color: 'bg-green-500' },
  { title: 'Total Teachers', count: 15, color: 'bg-blue-500' },
  { title: 'Total Students', count: 120, color: 'bg-yellow-500' },
];

const Dashboard = () => (
  <>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {stats.map((stat, index) => (
      <div key={index} className={`rounded-lg p-6 text-white shadow-lg ${stat.color}`}>
        <h3 className="text-lg font-semibold">{stat.title}</h3>
        <p className="text-3xl mt-2 font-bold">{stat.count}</p>
      </div>
    ))}
  </div>
    </>
);

export default Dashboard;
