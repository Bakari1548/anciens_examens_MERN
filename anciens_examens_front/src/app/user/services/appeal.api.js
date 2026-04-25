import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');

export const appealApi = {
  submitAppeal: async (message) => {
    const response = await axios.post(`${API_URL}/users/appeal`, 
      { message },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    return response.data;
  },

  getAllAppeals: async () => {
    const response = await axios.get(`${API_URL}/users/appeals`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return response.data;
  },

  approveAppeal: async (userId, reviewMessage) => {
    const response = await axios.put(`${API_URL}/users/appeals/${userId}/approve`,
      { reviewMessage },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    return response.data;
  },

  rejectAppeal: async (userId, reviewMessage) => {
    const response = await axios.put(`${API_URL}/users/appeals/${userId}/reject`,
      { reviewMessage },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    return response.data;
  }
};
