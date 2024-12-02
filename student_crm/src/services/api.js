export const API_BASE = 'http://localhost:5000/api';

export const fetchData = async (model) => {
  const response = await fetch(`${API_BASE}/${model}`);
  return response.json();
};

export const addData = async (model, data) => {
  await fetch(`${API_BASE}/${model}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};


