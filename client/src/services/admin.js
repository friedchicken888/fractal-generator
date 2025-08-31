const BASE_URL = 'http://localhost:3000/api';

export const getUsers = async (token, params) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/users?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteUser = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const toggleUserGeneration = async (id, token) => {
  const response = await fetch(`${BASE_URL}/admin/users/${id}/toggle-generation`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getAllHistory = async (token, params) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/history?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getAllGallery = async (token, params) => {
  const query = new URLSearchParams(params).toString();
  const response = await await fetch(`${BASE_URL}/admin/gallery?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteUserGallery = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/gallery`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};