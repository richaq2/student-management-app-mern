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


export const deleteData = async (model, id) => {
  const response = await fetch(`${API_BASE}/${model}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete data');
  }
  return response.json();
};


export const editData = async (updatedData,model, id) => {
  const response = await fetch(`${API_BASE}/${model}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) {
    throw new Error('Failed to Edit data');
  }
  return response.json();
};

export const fetchClasses = async () => {
  const response = await fetch(`${API_BASE}/classes`);
  if (!response.ok) {
    throw new Error('Failed to fetch classes');
  }
  return response.json();
};