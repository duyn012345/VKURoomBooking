import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data, error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .select('id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        const error = new Error(
          'Bạn không có quyền xóa phòng này.'
        );

        error.name = 'ROOM_DELETE_NOT_FOUND';

        throw error;
      }

      return data[0];
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-rooms'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['rooms'],
      });
    },
  });
}