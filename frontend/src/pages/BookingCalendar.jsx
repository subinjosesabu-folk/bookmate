import React, { useEffect, useState, useContext } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getBookings } from "../services/booking";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch employee bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getBookings({ userId: user.id });
      const calendarEvents = res.data.map((b) => ({
        id: b.id,
        title: `${b.resource} (${b.status})`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        allDay: false,
        status: b.status,
      }));
      setEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle selecting a new slot
  const handleSelectSlot = ({ start, end }) => {
    // Conflict check
    const conflict = events.some(
      (e) =>
        (start >= e.start && start < e.end) || (end > e.start && end <= e.end),
    );
    if (conflict) {
      alert("Time slot already booked!");
      return;
    }

    const formatForInput = (d) => moment(d).format("YYYY-MM-DDTHH:mm");
    navigate(
      `/bookings/new?start=${formatForInput(start)}&end=${formatForInput(end)}`,
    );
  };

  // Color-code events by status
  const eventStyleGetter = (event) => {
    let backgroundColor = "#e5fa60ff"; // default: blue
    if (event.status === "booked")
      backgroundColor = "#4ade80"; // green
    else if (event.status === "cancelled") backgroundColor = "#f87171"; // red

    return {
      style: {
        backgroundColor,
        color: "black",
        borderRadius: "4px",
        border: "none",
        padding: "2px 4px",
      },
    };
  };

  // Handle event click (view details)
  const handleSelectEvent = (event) => {
    navigate(`/bookings/${event.id}`);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day", "agenda"]}
          defaultView="week"
          popup
          eventPropGetter={eventStyleGetter}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
