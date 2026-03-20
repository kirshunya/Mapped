import axios from 'axios';
import useAuthStore from '../store/authStore';

// Use relative URLs - nginx will proxy /api/ to gateway
// This avoids CORS issues entirely since frontend and API are same origin
const API_URL = '';
export const WS_API_URL = `ws://${window.location.host}`;

const api = axios.create({
  baseURL: `/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  searchUsers: (q) => api.get('/auth/users/search', { params: { q } }),
};

export const placesAPI = {
  getAll: (params) => api.get('/places/all', { params }),
  getNearby: (params) => api.get('/places', { params }),
  getById: (id) => api.get(`/places/${id}`),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  delete: (id) => api.delete(`/places/${id}`),
  approve: (id, status) => api.put(`/places/${id}/approve`, { status }),
  getPending: () => api.get('/places/all', { params: { approval: 'pending' } }),
  getRecommendations: (params) => api.get('/places/recommendations', { params }),
  search: (q) => api.get('/search', { params: { q } }),
};

export const reviewsAPI = {
  getByPlace: (placeId) => api.get(`/places/${placeId}/reviews`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  addReaction: (data) => api.post('/reactions', data),
  addComment: (data) => api.post('/comments', data),
  getComments: (reviewId) => api.get(`/reviews/${reviewId}/comments`),
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  join: (id) => api.post(`/groups/${id}/join`),
  leave: (id) => api.post(`/groups/${id}/leave`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  addMember: (id, data) => api.post(`/groups/${id}/members`, data),
};

export const mediaAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  delete: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  reactToPost: (postId, type) => api.post(`/posts/${postId}/reactions`, { type }),
  reactToComment: (commentId, type) => api.post(`/comments/${commentId}/reactions`, { type }),
};

export const chatsAPI = {
  getChats: () => api.get('/chats'),
  createChat: (data) => api.post('/chats', data),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
};

export default api;
