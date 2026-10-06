// Đổi lỗi từ database thành câu tiếng Việt dễ hiểu
// export function bookingErrorMessage(error: { code?: string; message?: string }): string {
//   const msg = error.message ?? '';
//   if (msg.includes('SLOT_PAST')) return 'Ca này đã kết thúc, không thể đặt.';
//   if (msg.includes('ROOM_UNAVAILABLE')) return 'Phòng đang bảo trì, không thể đặt.';
//   if (msg.includes('one_per_user_slot')) return 'Bạn đã đặt một phòng khác trong ca này rồi.';
//   if (error.code === '23505') return 'Phòng vừa được người khác đặt trước bạn. Vui lòng chọn phòng khác.';
//   return msg || 'Đã xảy ra lỗi, vui lòng thử lại.';
// }
// Đổi lỗi từ database thành câu tiếng Việt dễ hiểu
export function bookingErrorMessage(error: { code?: string; message?: string }): string {
  const msg = error.message ?? '';
  if (msg.includes('SLOT_PAST')) return 'Ca này đã kết thúc, không thể đặt.';
  if (msg.includes('ROOM_UNAVAILABLE')) return 'Phòng đang bảo trì, không thể đặt.';
  if (msg.includes('one_per_user_slot')) return 'Bạn đã đặt một phòng khác trong ca này rồi.';
  if (error.code === '23505') return 'Phòng vừa được người khác đặt trước bạn. Vui lòng chọn phòng khác.';
  return msg || 'Đã xảy ra lỗi, vui lòng thử lại.';
}

export function cancelErrorMessage(error: { code?: string; message?: string }): string {
  const msg = error.message ?? '';
  if (msg.includes('CANNOT_CANCEL_PAST')) return 'Lượt đặt này đã kết thúc nên không thể hủy.';
  if (msg.includes('CANNOT_REOPEN')) return 'Lượt đặt này đã bị hủy trước đó.';
  return msg || 'Không hủy được, vui lòng thử lại.';
}