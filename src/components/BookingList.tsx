// _file: admin_dashboard/src/components/BookingList.tsx_
import { useState, useEffect, useCallback } from 'react';
import type { RoomBooking } from '../types';
import { bookingApi } from '../api/bookingApi';
import BookingDetails from './BookingDetails';
import { 
  FiCalendar, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiEye, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

function BookingList() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('booking_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getAllBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        const checkInDate = new Date(booking.check_in);
        
        switch (dateFilter) {
          case 'today':
            return bookingDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDate >= monthAgo;
          case 'upcoming':
            return checkInDate >= today;
          case 'past':
            return checkInDate < today;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'booking_date':
          aValue = new Date(a.booking_date);
          bValue = new Date(b.booking_date);
          break;
        case 'check_in':
          aValue = new Date(a.check_in);
          bValue = new Date(b.check_in);
          break;
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'total_price':
          aValue = parseFloat(a.total_price);
          bValue = parseFloat(b.total_price);
          break;
        default:
          aValue = a.booking_reference;
          bValue = b.booking_reference;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const handleViewDetails = (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (booking: RoomBooking, newStatus: string) => {
    try {
      await bookingApi.updateBookingStatus(booking.id, newStatus);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status.');
    }
  };

  const handleDeleteBooking = async (booking: RoomBooking) => {
    if (window.confirm(`Are you sure you want to delete booking ${booking.booking_reference}?`)) {
      try {
        await bookingApi.deleteBooking(booking.id);
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Failed to delete booking.');
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-400" />;
      case 'pending':
        return <FiClock className="text-yellow-400" />;
      case 'cancelled':
        return <FiXCircle className="text-red-400" />;
      case 'completed':
        return <FiCheckCircle className="text-blue-400" />;
      default:
        return <FiAlertCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center">
      <p>{error}</p>
      <button
        onClick={fetchBookings}
        className="mt-2 text-sm bg-red-800 hover:bg-red-700 px-3 py-1 rounded inline-flex items-center gap-2"
      >
        <FiRefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      {/* Booking Details Modal */}
      {isDetailsOpen && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={fetchBookings}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <FiCalendar className="text-blue-400 text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Room Bookings</h1>
            </div>
            <p className="text-slate-400 mt-2">Manage hotel room reservations</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={fetchBookings}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors inline-flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="booking_date">Booking Date</option>
                <option value="check_in">Check-in</option>
                <option value="full_name">Guest Name</option>
                <option value="total_price">Total Price</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-slate-400">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-700/50">
            <FiCalendar className="mx-auto text-6xl text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Bookings Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.' 
                : 'No room bookings have been made yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-900/30 to-blue-800/20">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-blue-200">Reference</th>
                    <th className="p-4 text-left text-sm font-medium text-blue-200">Guest</th>
                    <th className="p-4 text-left text-sm font-medium text-blue-200">Dates</th>
                    <th className="p-4 text-left text-sm font-medium text-blue-200">Guests</th>
                    <th className="p-4 text-right text-sm font-medium text-blue-200">Total</th>
                    <th className="p-4 text-center text-sm font-medium text-blue-200">Status</th>
                    <th className="p-4 text-right text-sm font-medium text-blue-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{booking.booking_reference}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(booking.booking_date)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{booking.full_name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <FiMail className="w-3 h-3" />
                              <span>{booking.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <FiPhone className="w-3 h-3" />
                              <span>{booking.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                          <p className="text-xs text-slate-400">{booking.nights} nights</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">
                          <p>{booking.adults} adults</p>
                          {booking.children > 0 && (
                            <p className="text-xs text-slate-400">{booking.children} children</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-bold text-green-400">₹{parseFloat(booking.total_price).toLocaleString()}</p>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status || 'pending'}
                          </span>
                          <select
                            value={booking.status || 'pending'}
                            onChange={(e) => handleUpdateStatus(booking, e.target.value)}
                            className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete booking"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingList;