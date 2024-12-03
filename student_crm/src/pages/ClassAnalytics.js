// ClassAnalytics.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClassAnalytics = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getClassData = async () => {
      try {
        const data = await fetchData(`classes/${id}`);
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    getClassData();
  }, [id]);

  if (loading) return <p>Loading class data...</p>;
  if (!classData) return <p>Class not found.</p>;

  // Prepare data for the chart
  const maleCount = classData.students.filter((student) => student.gender === 'Male').length;
  const femaleCount = classData.students.filter((student) => student.gender === 'Female').length;

  const chartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Number of Students',
        data: [maleCount, femaleCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gender Distribution' },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{classData.name} - {classData.year}</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Teacher:</h3>
        <ul className="list-disc list-inside">
          {classData.teacher.map((teacher) => (
            <li key={teacher._id}>
              {teacher.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Students:</h3>
        <ul className="list-disc list-inside">
          {classData.students.map((student) => (
            <li key={student._id}>
              {student.name} ({student.gender})
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Gender Distribution:</h3>
        <Bar className="class-charts" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ClassAnalytics;
