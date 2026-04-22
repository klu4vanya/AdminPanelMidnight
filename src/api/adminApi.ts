// api/adminApi.ts
import axios from "axios";
 

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api.midnight-club-app.ru/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const usersAPI = {
  getAll: () => api.get("/users"),
  get: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  ban: (id: number) => api.post(`/users/${id}/ban`),
  unban: (id: number) => api.post(`/users/${id}/unban`),
  addPoints: (id: number, points: number) =>
    api.post(`/users/${id}/add_points`, { points }),
};

export const gamesAdminAPI = {
  getGames: () => api.get("/games"),
  create: (data: any) => api.post("/games", { data }),
  update: (id: number, data: any) => api.patch(`/games/${id}`, data),
  delete: (id: number) => api.delete(`/games/${id}`),
};

export const participantsAPI = {
  getByGame: (gameId: number) => api.get(`/games/${gameId}/participants_admin`),
  add: (gameId: number, data: any) =>
    api.post(`/games/${gameId}/add_participant_admin`, data),
  remove: (gameId: number, data: any) =>
    api.post(`/games/${gameId}/remove_participant_admin`, data),
  update: (gameId: number, data: any) =>
    api.post(`/games/${gameId}/update_participant_admin`, data),
  addEntry: (gameId: number, userId: number) =>
    api.post(`/games/${gameId}/add_entry`, {
      user_id: userId,
      value: 1,
    }),
    addRebuy: (gameId: number, userId: number) =>
      api.post(`/games/${gameId}/add_rebuy`, {
        user_id: userId,
        value: 1,
      }),
};

export const historyAPI = {
  getAll: () => api.get("/tournament-history"),
  get: (id: number) => api.get(`/tournament-history/${id}`),
  create: (data: any) => api.post("/tournament-history", data),
  update: (id: number, data: any) =>
    api.patch(`/tournament-history/${id}`, data),
  delete: (id: number) => api.delete(`/tournament-history/${id}`),
  getParticipants: (id: number) =>
    api.get(`/tournament-history/${id}/participants`),
};
