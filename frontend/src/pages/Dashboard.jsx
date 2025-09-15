import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import { AuthContext } from "../context/AuthContext";
import { authApi, bookingApi } from "../utils/api";
import {
  FaUser,
  FaUserSlash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Booking states
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    user.role === "admin" ? "manageUsers" : "myBookings",
  );
  const [filters, setFilters] = useState({ resource: "", date: "" });

  // Resource states
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState("");

  // User management states
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // --------------------- FETCH BOOKINGS ---------------------
  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await bookingApi.fetchBookings();
      setBookings(res.data || res);
      setMeta(res.meta || { ...meta, page });
    } catch (err) {
      alert("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (["myBookings", "myCalendar", "allBookings"].includes(activeTab)) {
      fetchBookings(1);
    }
  }, [activeTab, filters]);

  // --------------------- BOOKING ACTIONS ---------------------
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingApi.deleteBooking(id);
      alert("Booking cancelled!");
      fetchBookings(meta.page);
    } catch (err) {
      alert("Failed to cancel booking");
      console.error(err);
    }
  };

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleClearFilters = () => setFilters({ resource: "", date: "" });

  // --------------------- RESOURCE MANAGEMENT ---------------------
  const fetchResources = async () => {
    try {
      const res = await bookingApi.fetchResources();
      setResources(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.trim()) return;
    try {
      await bookingApi.createResource({ name: newResource.trim() });
      setNewResource("");
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResourceStatus = async (id, currentStatus) => {
    try {
      await bookingApi.updateResource(id, { isActive: !currentStatus });
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "manageResources") fetchResources();
  }, [activeTab]);

  // --------------------- USER MANAGEMENT ---------------------
  const fetchUsers = async () => {
    try {
      const all = await authApi.listUsers();
      setAllUsers(all);
      setPendingUsers(all);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveUser = async (id, role) => {
    try {
      await authApi.updateUserRole(id, role);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserStatus = async (id, currentStatus) => {
    const action = currentStatus ? "Disable" : "Enable";
    if (!window.confirm(`${action} this user?`)) return;

    try {
      await authApi.updateUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "manageUsers") fetchUsers();
  }, [activeTab]);

  // --------------------- CALENDAR ---------------------
  const employeeEvents = bookings.map((b) => ({
    id: b.id,
    title: `${typeof b.resource === "string" ? b.resource : b.resource?.name || "N/A"} (${b.status})`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    allDay: false,
  }));

  const handleSelectSlot = ({ start, end }) => {
    const conflict = employeeEvents.some(
      (e) =>
        (start >= e.start && start < e.end) || (end > e.start && end <= e.end),
    );
    if (conflict) {
      alert("Time slot already booked!");
      return;
    }
    navigate(
      `/bookings/new?start=${start.toISOString()}&end=${end.toISOString()}`,
    );
  };

  // --------------------- RENDER ---------------------
  return (
    <div className="container mx-auto pt-20 p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {user.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
      </h1>

      {user.role === "user" && (
        <button
          onClick={() => navigate("/bookings/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Create Booking
        </button>
      )}

      {/* --------------------- TABS --------------------- */}
      <div className="flex gap-4 mb-4 border-b flex-wrap">
        {user.role === "user" && (
          <>
            <button
              onClick={() => setActiveTab("myBookings")}
              className={`px-4 py-2 ${
                activeTab === "myBookings"
                  ? "border-b-2 border-blue-600 font-semibold"
                  : ""
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("myCalendar")}
              className={`px-4 py-2 ${
                activeTab === "myCalendar"
                  ? "border-b-2 border-blue-600 font-semibold"
                  : ""
              }`}
            >
              My Calendar
            </button>
          </>
        )}

        {user.role === "admin" && (
          <>
            <button
              onClick={() => setActiveTab("manageUsers")}
              className={`px-4 py-2 ${
                activeTab === "manageUsers"
                  ? "border-b-2 border-blue-600 font-semibold"
                  : ""
              }`}
            >
              Manage Users/ Roles
            </button>
            <button
              onClick={() => setActiveTab("manageResources")}
              className={`px-4 py-2 ${
                activeTab === "manageResources"
                  ? "border-b-2 border-blue-600 font-semibold"
                  : ""
              }`}
            >
              Manage Resources
            </button>
            <button
              onClick={() => setActiveTab("allBookings")}
              className={`px-4 py-2 ${
                activeTab === "allBookings"
                  ? "border-b-2 border-blue-600 font-semibold"
                  : ""
              }`}
            >
              All Bookings
            </button>
          </>
        )}
      </div>

      {/* --------------------- EMPLOYEE: MY BOOKINGS --------------------- */}
      {user.role === "user" && activeTab === "myBookings" && (
        <div className="bg-white p-4 rounded shadow mb-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No bookings found
            </div>
          ) : (
            <table className="w-full text-left border">
              <thead>
                <tr className="border-b">
                  <th className="px-2">#</th>
                  <th className="px-2">Resource</th>
                  <th className="px-2">Start</th>
                  <th className="px-2">End</th>
                  <th className="px-2">Status</th>
                  <th className="px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-2">
                      {(meta.page - 1) * meta.limit + idx + 1}
                    </td>
                    <td className="py-2 px-2">
                      {typeof b.resource === "string"
                        ? b.resource
                        : b.resource?.name || "N/A"}
                    </td>
                    <td className="py-2 px-2">
                      {new Date(b.startTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-2">
                      {new Date(b.endTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 capitalize">{b.status}</td>
                    <td className="py-2 px-2 flex gap-3">
                      <button
                        onClick={() =>
                          navigate(`/bookings/${b.id}`, {
                            state: { booking: b },
                          })
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      {b.status !== "cancelled" && (
                        <>
                          <button
                            onClick={() => navigate(`/bookings/${b.id}/edit`)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination meta={meta} onPageChange={fetchBookings} />
        </div>
      )}

      {/* --------------------- EMPLOYEE: MY CALENDAR --------------------- */}
      {user.role === "user" && activeTab === "myCalendar" && (
        <div className="bg-white p-4 rounded shadow">
          <Calendar
            localizer={localizer}
            events={employeeEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            onSelectSlot={handleSelectSlot}
            views={["month", "week", "day"]}
            defaultView="week"
          />
        </div>
      )}

      {/* --------------------- ADMIN: ALL BOOKINGS --------------------- */}
      {user.role === "admin" && activeTab === "allBookings" && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">All Bookings</h2>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No bookings found
            </div>
          ) : (
            <table className="w-full text-left border">
              <thead>
                <tr className="border-b">
                  <th className="px-2">#</th>
                  <th className="px-2">Created By</th>
                  <th className="px-2">Resource</th>
                  <th className="px-2">Start</th>
                  <th className="px-2">End</th>
                  <th className="px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-2">
                      {(meta.page - 1) * meta.limit + idx + 1}
                    </td>
                    <td className="py-2 px-2">
                      {b.createdBy?.name || b.createdBy?.email || "N/A"}
                    </td>
                    <td className="py-2 px-2">
                      {typeof b.resource === "string"
                        ? b.resource
                        : b.resource?.name || "N/A"}
                    </td>
                    <td className="py-2 px-2">
                      {new Date(b.startTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-2">
                      {new Date(b.endTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination meta={meta} onPageChange={fetchBookings} />
        </div>
      )}

      {/* --------------------- ADMIN: MANAGE RESOURCES --------------------- */}
      {user.role === "admin" && activeTab === "manageResources" && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Manage Resources</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              className="border p-2 rounded"
              placeholder="Resource name"
            />
            <button
              onClick={handleAddResource}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <table className="w-full text-left border">
            <thead>
              <tr className="border-b">
                <th className="px-2">#</th>
                <th className="px-2">Name</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, idx) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2">{r.name}</td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleResourceStatus(r.id, r.isActive)}
                      className="flex items-center"
                      title={
                        r.isActive ? "Disable Resource" : "Enable Resource"
                      }
                    >
                      {r.isActive ? (
                        <FaToggleOn className="text-green-600 text-xl cursor-pointer" />
                      ) : (
                        <FaToggleOff className="text-red-600 text-xl cursor-pointer" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --------------------- ADMIN: MANAGE USERS --------------------- */}
      {user.role === "admin" && activeTab === "manageUsers" && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
          {pendingUsers.length === 0 ? (
            <div className="text-gray-500">No pending users</div>
          ) : (
            <table className="w-full text-left border">
              <thead>
                <tr className="border-b">
                  <th className="px-2">#</th>
                  <th className="px-2">Name</th>
                  <th className="px-2">Email</th>
                  <th className="px-2">Assign Role</th>
                  <th className="px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u, idx) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{u.name}</td>
                    <td className="py-2 px-2">{u.email}</td>
                    <td className="py-2 px-2">
                      {u.id === user.id ? (
                        <select
                          value={u.role?.name || ""}
                          className="border p-1 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                          disabled
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <select
                          value={u.role?.name || ""}
                          className="border p-1 rounded"
                          onChange={(e) =>
                            handleApproveUser(u.id, e.target.value)
                          }
                        >
                          <option value="">Select Role</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="py-2 px-2 flex gap-2">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleUserStatus(u.id, u.isEnabled)}
                          className={`flex items-center gap-1 px-2 py-1 border rounded ${
                            u.isEnabled
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={u.isEnabled ? "Disable User" : "Enable User"}
                        >
                          {u.isEnabled ? <FaUserSlash /> : <FaUser />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
