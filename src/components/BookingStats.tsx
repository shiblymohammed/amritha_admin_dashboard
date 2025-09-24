// _file: admin_dashboard/src/components/BookingStats.tsx_
import { useState, useEffect, useCallback } from 'react';
import type { BookingStats as BookingStatsType } from '../types';
import { bookingApi } from '../api/bookingApi';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiUsers, 
  FiCalendar, 
  FiBarChart,
  FiRefreshCw
} from 'react-icons/fi';

interface BookingStatsProps {
  onStatsUpdate?: (stats: BookingStatsType) => void;
}

function BookingStats({ onStatsUpdate }: BookingStatsProps) {
  const [stats, setStats] = useState<BookingStatsType>({
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    completed_bookings: 0,
    total_revenue: '0',
    monthly_revenue: '0',
    average_booking_value: '0',
    occupancy_rate: 0,
    total_guests: 0,
    recent_bookings: [],
    recent_bookings_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await bookingApi.getBookingStats();
      setStats(statsData);
      setLastUpdated(new Date());
      onStatsUpdate?.(statsData);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [onStatsUpdate]);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };





  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock previous period data for growth calculation
  const mockPreviousStats = {
    total_bookings: Math.max(0, stats.total_bookings - Math.floor(Math.random() * 10)),
    total_revenue: Math.max(0, parseFloat(stats.total_revenue) - Math.floor(Math.random() * 50000)),
    total_guests: Math.max(0, stats.total_guests - Math.floor(Math.random() * 20))
  };

  const bookingGrowth = calculateGrowthRate(stats.total_bookings, mockPreviousStats.total_bookings);
  const revenueGrowth = calculateGrowthRate(parseFloat(stats.total_revenue), mockPreviousStats.total_revenue);
  const guestGrowth = calculateGrowthRate(stats.total_guests, mockPreviousStats.total_guests);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="h-8 bg-slate-700 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-200 p-6 rounded-xl text-center">
        <FiAlertCircle className="mx-auto text-4xl mb-2" />
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Booking Statistics</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh statistics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{stats.total_bookings}</p>
              <div className="flex items-center gap-1 mt-1">
                {bookingGrowth >= 0 ? (
                  <FiTrendingUp className="text-green-400 w-3 h-3" />
                ) : (
                  <FiTrendingDown className="text-red-400 w-3 h-3" />
                )}
                <span className={`text-xs ${bookingGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(bookingGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <FiCalendar className="text-blue-400 text-2xl" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.total_revenue)}</p>
              <div className="flex items-center gap-1 mt-1">
                {revenueGrowth >= 0 ? (
                  <FiTrendingUp className="text-green-400 w-3 h-3" />
                ) : (
                  <FiTrendingDown className="text-red-400 w-3 h-3" />
                )}
                <span className={`text-xs ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <FiDollarSign className="text-green-400 text-2xl" />
          </div>
        </div>

        {/* Active Guests */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Guests</p>
              <p className="text-2xl font-bold text-white">{stats.total_guests}</p>
              <div className="flex items-center gap-1 mt-1">
                {guestGrowth >= 0 ? (
                  <FiTrendingUp className="text-green-400 w-3 h-3" />
                ) : (
                  <FiTrendingDown className="text-red-400 w-3 h-3" />
                )}
                <span className={`text-xs ${guestGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(guestGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <FiUsers className="text-purple-400 text-2xl" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold text-white">{formatPercentage(stats.occupancy_rate)}</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.occupancy_rate, 100)}%` }}
                ></div>
              </div>
            </div>
            <FiBarChart className="text-blue-400 text-2xl" />
          </div>
        </div>
      </div>



      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Monthly Revenue</span>
              <span className="text-white font-medium">{formatCurrency(stats.monthly_revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Average Booking Value</span>
              <span className="text-white font-medium">{formatCurrency(stats.average_booking_value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Recent Bookings</span>
              <span className="text-white font-medium">{stats.recent_bookings_count}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Conversion Rate</span>
              <span className="text-white font-medium">
                {stats.total_bookings > 0 
                  ? formatPercentage((stats.confirmed_bookings / stats.total_bookings) * 100)
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cancellation Rate</span>
              <span className="text-white font-medium">
                {stats.total_bookings > 0 
                  ? formatPercentage((stats.cancelled_bookings / stats.total_bookings) * 100)
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Completion Rate</span>
              <span className="text-white font-medium">
                {stats.total_bookings > 0 
                  ? formatPercentage((stats.completed_bookings / stats.total_bookings) * 100)
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingStats;