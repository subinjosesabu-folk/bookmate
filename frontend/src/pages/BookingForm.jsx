import { useEffect, useState } from "react";
import { bookingApi } from "../utils/api";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import moment from "moment";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read query params for pre-filling from calendar
  const params = new URLSearchParams(location.search);
  const startParam = params.get("start") || "";
  const endParam = params.get("end") || "";

  const [busy, setBusy] = useState(false);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resource: "",
    startTime: startParam,
    endTime: endParam,
    notes: "",
    status: "BOOKED",
  });

  // Helper: convert ISO → datetime-local format
  const formatForInput = (isoString) =>
    isoString ? moment(isoString).format("YYYY-MM-DDTHH:mm") : "";

  // Fetch resources
  useEffect(() => {
    (async () => {
      try {
        const res = await bookingApi.fetchResources();
        setResources(res || []);
      } catch (err) {
        console.error("Failed to load resources", err);
      }
    })();
  }, []);

  // Load booking if editing
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await bookingApi.fetchBookingById(id);
          setForm({
            resource: res.resource?.id || "",
            startTime: formatForInput(res.startTime),
            endTime: formatForInput(res.endTime),
            notes: res.notes || "",
            status: res.status || "BOOKED",
          });
        } catch (err) {
          alert("Failed to load booking");
        }
      })();
    }
  }, [id]);

  // Pre-fill from calendar
  useEffect(() => {
    if (!id) {
      setForm((f) => ({
        ...f,
        startTime: startParam
          ? moment(startParam).format("YYYY-MM-DDTHH:mm")
          : "",
        endTime: endParam ? moment(endParam).format("YYYY-MM-DDTHH:mm") : "",
      }));
    }
  }, [startParam, endParam, id]);

  const submit = async (e) => {
    e.preventDefault();

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const now = new Date();

    // 1. Must be current/future
    if (start < now) {
      alert("Start time must be in the future.");
      return;
    }

    // 2. End must be after start
    if (end <= start) {
      alert("End time must be later than start time.");
      return;
    }

    // 3. Max 4 hours
    const diffInHours = (end - start) / (1000 * 60 * 60);
    if (diffInHours > 4) {
      alert("Booking duration cannot exceed 4 hours.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        resource: form.resource,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: form.notes,
        status: form.status,
      };

      if (id) {
        await bookingApi.updateBooking(id, payload);
        alert("Booking updated");
      } else {
        await bookingApi.createBooking(payload);
        alert("Booking created");
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container pt-20">
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          {id ? "Edit Booking" : "Create Booking"}
        </h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">Resource</label>
            <select
              required
              value={form.resource}
              onChange={(e) =>
                setForm((f) => ({ ...f, resource: e.target.value }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select a resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm">Start</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">End</label>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="w-full p-2 border rounded"
              rows="4"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={busy}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {busy ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
