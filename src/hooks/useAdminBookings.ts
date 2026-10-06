import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AdminBooking } from '../types';

export function useAdminBookings() {
  return useQuery<AdminBooking[], Error>({
    queryKey: ['admin-bookings'],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, booking_date, slot, status, user_id, rooms(name), profiles(full_name, role, email)'
        )
        .order('booking_date', {
          ascending: false,
        })
        .limit(300);

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as AdminBooking[];
    },
  });
}