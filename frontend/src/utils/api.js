import axios from "axios";

// Base URLs from .env
const AUTH_URL = process.env.REACT_APP_AUTH_API;
const BOOKING_URL = process.env.REACT_APP_BOOKING_API;

// Axios instance with token
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- AUTH SERVICE ----------------
export const authApi = {
  async login(email, password) {
    const res = await axios.post(`${AUTH_URL}/auth/login`, { email, password });
    console.log(res.data);
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    return { token, user };
  },

  async register({ name, email, password }) {
    const res = await axios.post(`${AUTH_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return res.data;
  },

  async listUsers() {
    const res = await api.get(`${AUTH_URL}/auth/users`);
    return res.data;
  },

  async updateUserRole(id, roleName) {
    const res = await api.patch(`${AUTH_URL}/auth/users/${id}/role`, {
      roleName,
    });
    return res.data;
  },

  async updateUserStatus(id, isEnabled) {
    const res = await api.patch(`${AUTH_URL}/auth/users/${id}/status`, {
      isEnabled,
    });
    return res.data;
  },
};

// ---------------- BOOKING SERVICE ----------------
export const bookingApi = {
  // Resources
  async createResource(data) {
    const res = await api.post(`${BOOKING_URL}/resources`, data);
    return res.data;
  },

  async fetchResources() {
    const res = await api.get(`${BOOKING_URL}/resources`);
    return res.data;
  },

  async updateResource(id, data) {
    const res = await api.patch(`${BOOKING_URL}/resources/${id}`, data);
    return res.data;
  },

  // Bookings
  async createBooking(data) {
    const res = await api.post(`${BOOKING_URL}/bookings`, data);
    return res.data;
  },

  async fetchBookings() {
    const res = await api.get(`${BOOKING_URL}/bookings`);
    return res.data;
  },

  async fetchBookingById(id) {
    const res = await api.get(`${BOOKING_URL}/bookings/${id}`);
    return res.data;
  },

  async updateBooking(id, data) {
    const res = await api.patch(`${BOOKING_URL}/bookings/${id}`, data);
    return res.data;
  },

  async deleteBooking(id) {
    const res = await api.delete(`${BOOKING_URL}/bookings/${id}`);
    return res.data;
  },
};
