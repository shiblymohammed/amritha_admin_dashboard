// _file: admin_dashboard/src/api/bookingApi.ts_
import apiClient from './axiosConfig';
import type { RoomBooking, BookingStats } from '../types';

export const bookingApi = {
  // Get all bookings
  getAllBookings: async (): Promise<RoomBooking[]> => {
    const response = await apiClient.get('/room-bookings/');
    return response.data.data || response.data;
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<RoomBooking> => {
    const response = await apiClient.get(`/room-bookings/${id}/`);
    return response.data.data || response.data;
  },

  // Get booking by reference
  getBookingByReference: async (reference: string): Promise<RoomBooking> => {
    const response = await apiClient.get(`/room-bookings/${reference}/`);
    return response.data.data || response.data;
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: string): Promise<RoomBooking> => {
    const response = await apiClient.patch(`/room-bookings/${id}/`, { status });
    return response.data.data || response.data;
  },

  // Delete booking
  deleteBooking: async (id: number): Promise<void> => {
    await apiClient.delete(`/room-bookings/${id}/`);
  },

  // Get booking statistics
  getBookingStats: async (): Promise<BookingStats> => {
    const response = await apiClient.get('/room-bookings/stats/');
    return response.data.data || response.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 5): Promise<RoomBooking[]> => {
    const response = await apiClient.get(`/room-bookings/?limit=${limit}&ordering=-booking_date`);
    return response.data.data || response.data;
  },

  // Search bookings
  searchBookings: async (query: string): Promise<RoomBooking[]> => {
    const response = await apiClient.get(`/room-bookings/?search=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  },

  // Filter bookings by date range
  getBookingsByDateRange: async (startDate: string, endDate: string): Promise<RoomBooking[]> => {
    const response = await apiClient.get(`/room-bookings/?check_in_after=${startDate}&check_in_before=${endDate}`);
    return response.data.data || response.data;
  },

  // Get bookings by status
  getBookingsByStatus: async (status: string): Promise<RoomBooking[]> => {
    const response = await apiClient.get(`/room-bookings/?status=${status}`);
    return response.data.data || response.data;
  }
};

export default bookingApi;