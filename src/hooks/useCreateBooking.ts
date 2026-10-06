import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface CreateBookingInput {
  roomId: string;
  bookingDate: string;
  slotId: number;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      bookingDate,
      slotId,
    }: CreateBookingInput) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          room_id: roomId,
          booking_date: bookingDate,
          slot: slotId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [
          'bookings',
          variables.bookingDate,
          variables.slotId,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          'room-bookings',
          variables.roomId,
          variables.bookingDate,
        ],
      });
    },
  });
}