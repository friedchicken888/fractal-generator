const BASE_URL = 'http://localhost:3000/api';

export const generateFractal = async (params, token) => {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  return response;
};

export const listFractals = async (page = 1, limit = 10, token) => {
  const response = await fetch(`${BASE_URL}/fractals?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getFractalDetails = async (fractalId, token) => {
  const response = await fetch(`${BASE_URL}/fractals/${fractalId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteFractal = async (fractalId, token) => {
  const response = await fetch(`${BASE_URL}/fractals/${fractalId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const searchFractals = async (query, token) => {
  const response = await fetch(`${BASE_URL}/fractals/search?query=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};