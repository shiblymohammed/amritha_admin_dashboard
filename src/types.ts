// _file: admin_dashboard/src/types.ts_

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string; // Django's DecimalField is serialized as a string
  image: string | null; // The image URL can be null
  is_vegetarian?: boolean;
  is_available?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailySpecial {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  image?: File | null;
  is_vegetarian?: boolean;
  is_available?: boolean;
  category?: string;
  is_special?: boolean;
}

export interface MenuItemFormProps {
  itemToEdit: MenuItem | DailySpecial | null;
  onClose: () => void;
  onSuccess: () => void;
  isSpecial?: boolean;
}

// Booking related interfaces
export interface RoomBooking {
  id: number;
  booking_reference: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  special_requests?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  selected_rooms: SelectedRoom[];
  total_price: string;
  nights: number;
  booking_date: string;
}

export interface SelectedRoom {
  id: number;
  name: string;
  quantity: number;
  occupancy: 'single' | 'double';
  price: number | string;
  description?: string;
  max_guests?: number;
}

export interface BookingStats {
  total_bookings: number;
  total_revenue: string;
  monthly_revenue: string;
  average_booking_value: string;
  occupancy_rate: number;
  total_guests: number;
  recent_bookings: RoomBooking[];
  recent_bookings_count: number;
}

export interface NotificationItem {
  id: string;
  type: 'booking' | 'menu' | 'system' | 'cancellation' | 'confirmation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  booking_reference?: string;
  data?: any;
}