import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface SetRoomStatusInput {
  roomId: string;
  status: 'active' | 'maintenance';
}

export function useAdminRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      status,
    }: SetRoomStatusInput) => {
      const { data, error } = await supabase.rpc(
        'admin_set_room_status',
        {
          p_room: roomId,
          p_status: status,
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-rooms'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['rooms'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
    },
  });
}