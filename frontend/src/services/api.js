import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const academicAPI = {
  // Generate explanation
  generateExplanation: async (topic, depth, analogy) => {
    const response = await api.post('/explain', {
      topic,
      depth,
      analogy
    });
    return response.data;
  },

  // Search topics
  searchTopics: async (query, limit = 10) => {
    const response = await api.get('/topics/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Get image sources status
  getImageSourcesStatus: async () => {
    const response = await api.get('/image-sources/status');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get model info
  getModelInfo: async () => {
    const response = await api.get('/model/info');
    return response.data;
  }
};

export default api;
