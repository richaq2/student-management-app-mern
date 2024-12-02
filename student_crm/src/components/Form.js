import React, { useState } from 'react';

const Form = ({ model, onSubmit }) => {
  const [formData, setFormData] = useState(model);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      {Object.keys(model).map((field) => (
        <div key={field}>
          <label className="block text-sm font-semibold capitalize mb-1">{field}</label>
          <input
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Submit
      </button>
    </form>
  );
};

export default Form;
