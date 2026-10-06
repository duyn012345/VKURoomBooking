import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BookingWithRoom } from '../types';

export function useMyBookings(userId: string) {
  return useQuery<BookingWithRoom[], Error>({
    queryKey: ['my-bookings', userId],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, booking_date, slot, status, rooms(name, location, image_url)'
        )
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as unknown as BookingWithRoom[];
    },

    enabled: Boolean(userId),
  });
}