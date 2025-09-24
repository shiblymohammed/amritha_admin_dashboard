// _file: admin_dashboard/src/components/BookingDetails.tsx_
import { useState } from 'react';
import type { RoomBooking } from '../types';
import { bookingApi } from '../api/bookingApi';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiCreditCard,
  FiUsers,
  FiRefreshCw,
  FiPrinter,
  FiDownload,
  FiMessageSquare
} from 'react-icons/fi';

interface BookingDetailsProps {
  booking: RoomBooking;
  onClose: () => void;
  onUpdate: () => void;
}

function BookingDetails({ booking, onClose, onUpdate }: BookingDetailsProps) {
  const [editedBooking, setEditedBooking] = useState(booking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);





  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <p className="text-slate-300 mt-1">Reference: {booking.booking_reference}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Print"
            >
              <FiPrinter className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Download"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Booking Information Header */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">
              Booked on {formatDateTime(booking.booking_date)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Information */}
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiUser className="text-blue-400" />
                Guest Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiUser className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white font-medium">{booking.full_name}</p>
                    <p className="text-slate-400 text-sm">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">{booking.email}</p>
                    <p className="text-slate-400 text-sm">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">{booking.phone}</p>
                    <p className="text-slate-400 text-sm">Phone Number</p>
                  </div>
                </div>
                {booking.address && (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-slate-400 w-4 h-4" />
                    <div>
                      <p className="text-white">{booking.address}</p>
                      <p className="text-slate-400 text-sm">Address</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-400" />
                Booking Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">{formatDate(booking.check_in)}</p>
                    <p className="text-slate-400 text-sm">Check-in Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">{formatDate(booking.check_out)}</p>
                    <p className="text-slate-400 text-sm">Check-out Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">{calculateNights()} nights</p>
                    <p className="text-slate-400 text-sm">Duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiUsers className="text-slate-400 w-4 h-4" />
                  <div>
                    <p className="text-white">
                      {booking.adults} adults
                      {booking.children > 0 && `, ${booking.children} children`}
                    </p>
                    <p className="text-slate-400 text-sm">Guests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            <h3 className="text-lg font-semibold text-white mb-4">Room Selection</h3>
            <div className="space-y-4">
              {booking.selected_rooms && booking.selected_rooms.length > 0 ? (
                booking.selected_rooms.map((room, index) => (
                  <div key={index} className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{room.name}</h4>
                        <p className="text-slate-400 text-sm mt-1">{room.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-slate-300">Quantity: {room.quantity}</span>
                          <span className="text-slate-300">Max Guests: {room.max_guests}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{room.price ? parseFloat(room.price.toString()).toLocaleString() : '0'}</p>
                        <p className="text-slate-400 text-sm">per night</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No room details available</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-400" />
              Payment Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300">Subtotal</span>
                <span className="text-white">₹{booking.total_price ? (parseFloat(booking.total_price) * 0.9).toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300">Taxes & Fees</span>
                <span className="text-white">₹{booking.total_price ? (parseFloat(booking.total_price) * 0.1).toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-lg font-semibold">
                <span className="text-white">Total Amount</span>
                <span className="text-green-400">₹{booking.total_price ? parseFloat(booking.total_price).toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiMessageSquare className="text-blue-400" />
                Special Requests
              </h3>
              <p className="text-slate-300 leading-relaxed">{booking.special_requests}</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default BookingDetails;