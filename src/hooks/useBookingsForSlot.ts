import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface BookingRow {
  room_id: string;
  user_id: string;
}

export function useBookingsForSlot(
  date: string,
  slotId: number
) {
  return useQuery<BookingRow[], Error>({
    queryKey: ['bookings', date, slotId],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('room_id, user_id')
        .eq('booking_date', date)
        .eq('slot', slotId)
        .eq('status', 'confirmed');

      if (error) {
        throw error;
      }

      return (data ?? []) as BookingRow[];
    },
  });
}