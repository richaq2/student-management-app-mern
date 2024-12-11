export const API_BASE = 'https://student-management-app-mern-tmvx.onrender.com/api';

const TOKEN_KEY = 'authUser';


const getToken = () => {
  const storedUser = localStorage.getItem(TOKEN_KEY);
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user.token; 
  }
  return null;
};

const setToken = (data) => {

  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * @param {string} endpoint
 * @param {Object} options 
 * @returns {Promise<Object>} 
 */
const authFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = options.headers || {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please log in again.');
    }


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    
    if (response.status === 204) {
      return { message: 'Operation successful' };
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

/**

 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} 
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    if (data.token) {
      setToken(data);
    }

    return data;
  } catch (error) {

    throw error;
  }
};

/**
 * @returns {void}
 */
export const logout = () => {
  removeToken();
};

/**

 * @param {string} model -
 * @returns {Promise<Array>} 
 */
export const fetchData = async (model) => {
  return await authFetch(model, {
    method: 'GET',
  });
};

/**
 * @param {string} model 
 * @param {Object} data 
 * @returns {Promise<Object>} T
 */
export const addData = async (model, data) => {
  return await authFetch(model, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * @param {string} model 
 * @param {string} id 
 * @returns {Promise<Object>} 
 */
export const deleteData = async (model, id) => {
  return await authFetch(`${model}/${id}`, {
    method: 'DELETE',
  });
};

/**
 * @param {string} model 
 * @param {string} id 
 * @param {Object} updatedData 
 * @returns {Promise<Object>} 
 */
export const editData = async (model, id, updatedData) => {
  return await authFetch(`${model}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

/**
 * @param {string} model 
 * @param {string} id 
 * @param {Object} updatedData 
 * @returns {Promise<Object>} 
 */
export const editMe = async (updatedData) => {
  return await authFetch('me', {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

/**
 * @returns {Promise<Array>} 
 */
export const fetchClasses = async () => {
  return await fetchData('classes');
};

/**
 * @returns {Promise<Object>} 
 */
export const fetchAvailableYears = async () => {
  return await authFetch('analytics/available-years', {
    method: 'GET',
  });
};

/**

 * @param {number} year 
 * @returns {Promise<Object>}
 */
export const fetchAvailableMonths = async (year) => {
  return await authFetch(`analytics/available-months?year=${year}`, {
    method: 'GET',
  });
};

/**
 * @param {string} view 
 * @param {number} year
 * @param {number} [month] 
 * @returns {Promise<Object>}
 */
export const fetchFinancialAnalytics = async (view, year, month = null) => {
  let query = `view=${view}&year=${year}`;
  if (view === 'monthly' && month) {
    query += `&month=${month}`;
  }

  return await authFetch(`analytics/financial?${query}`, {
    method: 'GET',
  });
};
