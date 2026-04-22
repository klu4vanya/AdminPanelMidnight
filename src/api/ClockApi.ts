import axios from "axios";

const API_URL =
  process.env.REACT_APP_CLOCK_API_URL ||
  "https://api.midnight-club-app.ru/clock";

const ADMIN_PASSWORD = "BeddoNiTaizaiSuruSutekinaHi";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${ADMIN_PASSWORD}`;
  return config;
});

export const clocksAPI = {
  // tournaments
  getGames: () => api.get(`/tournaments/`),
  getTournament: (id: string) => api.get(`/tournaments/${id}`),
  createTournament: (name: string) =>
    api.post(`/tournaments/`, { name }),
  // levels
  getLevels: (id: string) =>
    api.get(`/tournaments/${id}/levels`),
  deleteLevel: (tournamentId: string, levelId: string) =>
    api.delete(`/tournaments/${tournamentId}/levels/${levelId}`),

  createLevel: (id: string, data: any) =>
    api.post(`/tournaments/${id}/levels`, data),

  // timer
  start: (id: string) =>
    api.post(`/tournaments/${id}/start`),

  pause: (id: string) =>
    api.post(`/tournaments/${id}/pause`),

  resume: (id: string) =>
    api.post(`/tournaments/${id}/resume`),
  deleteTournament: (id: string) => api.delete(`/tournaments/${id}`),

  nextLevel: (id: string) =>
    api.post(`/tournaments/${id}/next`),
};