// Simulated database
let users = [
  {
    id: 3,
    username: "manager@gmail.com",
    password: "manager123",
    role: "admin",
  },
  { id: 2, username: "siya@gmail.com", password: "1234", role: "user" },
];
let bookings = [
  {
    id: 1,
    username: "siya@gmail.com",
    password: "passord123",
    role: "employee",
  },
  {
    id: 2,
    username: "manager@gmail.com",
    password: "manager123",
    role: "manager",
    status: "approved",
  },
];

// Simulated delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const fakeApi = {
  async login(username, password) {
    await delay(800);
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) return { token: "fake-jwt-token", user };
    throw new Error("Invalid credentials");
  },

  async register(username, password) {
    await delay(800);
    const exists = users.find((u) => u.username === username);
    if (exists) throw new Error("User already exists");
    const newUser = { id: Date.now(), username, password };
    users.push(newUser);
    return newUser;
  },

  async fetchBookings() {
    await delay(500);
    return bookings;
  },

  async fetchBookingById(id) {
    await delay(500);
    return bookings.find((b) => b.id === parseInt(id));
  },

  async createBooking(data) {
    await delay(500);
    const newBooking = { id: Date.now(), ...data };
    bookings.push(newBooking);
    return newBooking;
  },
};
