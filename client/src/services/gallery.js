const BASE_URL = 'http://localhost:3000/api';

export const getGallery = async (token, params) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/gallery?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteGalleryItem = async (id, token) => {
  const response = await fetch(`${BASE_URL}/gallery/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
