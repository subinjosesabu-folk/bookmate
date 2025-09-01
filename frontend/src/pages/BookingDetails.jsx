import { useLocation, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const BookingDetails = () => {
  const { state } = useLocation();
  const booking = state?.booking;
  const { user } = useContext(AuthContext); // get logged-in user

  if (!booking) return <div className="container py-6">No booking found</div>;

  return (
    <div className="container pt-20 mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-6">Booking Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Resource:</strong>{" "}
            {typeof booking.resource === "string"
              ? booking.resource
              : booking.resource?.name || "N/A"}
          </div>
          <div>
            <strong>Status:</strong> {booking.status}
          </div>
          <div>
            <strong>Start:</strong>{" "}
            {new Date(booking.startTime).toLocaleString()}
          </div>
          <div>
            <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
          </div>
          <div className="md:col-span-2">
            <strong>Notes:</strong>
            <p className="mt-2">{booking.notes || "N/A"}</p>
          </div>

          {/* Only show "Created By" if role = admin */}
          {user.role === "admin" && (
            <div>
              <strong>Created By:</strong>{" "}
              {booking.createdBy?.name || booking.createdBy?.email || "N/A"}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/bookings/${booking.id}/edit`}
            className="px-3 py-1 border rounded"
          >
            Edit
          </Link>
          <Link to="/dashboard" className="px-3 py-1 border rounded">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
