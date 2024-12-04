// src/api.js

// Base URL for your backend API
export const API_BASE = 'http://localhost:5000/api';

// Key for storing the JWT token in localStorage
const TOKEN_KEY = 'authUser';

// Utility functions to manage JWT tokens
const getToken = () => {
  const storedUser = localStorage.getItem(TOKEN_KEY);
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user.token; // Assuming your backend returns { username, role, token }
  }
  return null;
};

const setToken = (data) => {
  // data should include username, role, and token
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Helper function to make authenticated API requests.
 * Automatically includes the JWT token in the Authorization header if available.
 * @param {string} endpoint - The API endpoint (relative to API_BASE).
 * @param {Object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<Object>} The JSON response data.
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

    // Handle unauthorized errors
    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please log in again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    // If there's no content (e.g., DELETE requests), return a success message
    if (response.status === 204) {
      return { message: 'Operation successful' };
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Handles user login by sending credentials to the backend.
 * On success, stores the received JWT token.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The response data containing username, role, and token.
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
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Handles user logout by clearing the JWT token.
 * @returns {void}
 */
export const logout = () => {
  removeToken();
};

/**
 * Fetches data from a specified model (e.g., 'classes', 'students', 'teachers').
 * @param {string} model - The model name.
 * @returns {Promise<Array>} The array of fetched data.
 */
export const fetchData = async (model) => {
  return await authFetch(model, {
    method: 'GET',
  });
};

/**
 * Adds new data to a specified model.
 * @param {string} model - The model name.
 * @param {Object} data - The data to add.
 * @returns {Promise<Object>} The created data object.
 */
export const addData = async (model, data) => {
  return await authFetch(model, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Deletes data from a specified model by ID.
 * @param {string} model - The model name.
 * @param {string} id - The ID of the data to delete.
 * @returns {Promise<Object>} The response message.
 */
export const deleteData = async (model, id) => {
  return await authFetch(`${model}/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Edits existing data in a specified model by ID.
 * @param {string} model - The model name.
 * @param {string} id - The ID of the data to edit.
 * @param {Object} updatedData - The updated data.
 * @returns {Promise<Object>} The updated data object.
 */
export const editData = async (model, id, updatedData) => {
  return await authFetch(`${model}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

/**
 * Edits existing data in a specified model by ID.
 * @param {string} model - The model name.
 * @param {string} id - The ID of the data to edit.
 * @param {Object} updatedData - The updated data.
 * @returns {Promise<Object>} The updated data object.
 */
export const editMe = async (updatedData) => {
  return await authFetch('me', {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

/**
 * Fetches all classes.
 * @returns {Promise<Array>} The array of classes.
 */
export const fetchClasses = async () => {
  return await fetchData('classes');
};

/**
 * Fetches analytics available years.
 * @returns {Promise<Object>} The available years.
 */
export const fetchAvailableYears = async () => {
  return await authFetch('analytics/available-years', {
    method: 'GET',
  });
};

/**
 * Fetches analytics available months for a given year.
 * @param {number} year - The year for which to fetch available months.
 * @returns {Promise<Object>} The available months.
 */
export const fetchAvailableMonths = async (year) => {
  return await authFetch(`analytics/available-months?year=${year}`, {
    method: 'GET',
  });
};

/**
 * Fetches financial analytics based on view, year, and optionally month.
 * @param {string} view - 'monthly' or 'yearly'.
 * @param {number} year - The year for analytics.
 * @param {number} [month] - The month for monthly view.
 * @returns {Promise<Object>} The financial data.
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
