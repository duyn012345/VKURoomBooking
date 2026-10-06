// import { FlashList, ListRenderItem } from '@shopify/flash-list';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   ScrollView, StyleSheet,
//   Text, TextInput, TouchableOpacity,
//   View,
// } from 'react-native';
// //new
// import RoomCard from '../components/RoomCard';
// import RoomDetailModal from '../components/RoomDetailModal';
// import { COLORS, SLOTS } from '../constants';
// import { defaultSelection, isSlotPast, nextDays, prettyDate, toYMD, weekday } from '../lib/dates';
// import { bookingErrorMessage } from '../lib/errors';
// import { supabase } from '../lib/supabase';
// import { Room, Slot } from '../types';

// type SizeFilter = 'all' | 'small' | 'medium' | 'large';
// type StatusFilter = 'all' | 'available' | 'occupied' | 'maintenance';

// const DAYS = nextDays(14);

// const SIZE_FILTERS: { key: SizeFilter; label: string }[] = [
//   { key: 'all', label: 'Mọi kích cỡ' },
//   { key: 'small', label: 'Nhỏ ≤30' },
//   { key: 'medium', label: 'Vừa 31-60' },
//   { key: 'large', label: 'Lớn >60' },
// ];
// const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
//   { key: 'all', label: 'Tất cả' },
//   { key: 'available', label: 'Available' },
//   { key: 'occupied', label: 'Occupied' },
//   { key: 'maintenance', label: 'Bảo trì' },
// ];

// const sizeOf = (c: number): Exclude<SizeFilter, 'all'> => (c <= 30 ? 'small' : c <= 60 ? 'medium' : 'large');

// interface BookingRow {
//   room_id: string;
//   user_id: string;
// }

// function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
//   return (
//     <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
//       <Text style={[styles.chipText, active && styles.textWhite]}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// function SlotChip({
//   slot, active, disabled, onPress,
// }: { slot: Slot; active: boolean; disabled: boolean; onPress: () => void }) {
//   return (
//     <TouchableOpacity
//       disabled={disabled}
//       onPress={onPress}
//       style={[styles.slotChip, active && styles.chipActive, disabled && styles.chipDisabled]}
//     >
//       <Text style={[styles.slotLabel, active && styles.textWhite, disabled && styles.textGray]}>{slot.label}</Text>
//       <Text style={[styles.slotTime, active && styles.textWhite, disabled && styles.textGray]}>{slot.time}</Text>
//     </TouchableOpacity>
//   );
// }

// export default function HomeScreen({ userId }: { userId: string }) {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [booked, setBooked] = useState<Record<string, string>>({}); // { room_id: user_id }
//   const [loading, setLoading] = useState<boolean>(true);
//   const [date, setDate] = useState<string>(() => defaultSelection().date);
//   const [slotId, setSlotId] = useState<number>(() => defaultSelection().slotId);
//   const [search, setSearch] = useState<string>('');
//   const [sizeFilter, setSizeFilter] = useState<SizeFilter>('all');
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
//   const [tick, setTick] = useState<number>(0);
//   const [roomsTick, setRoomsTick] = useState<number>(0);
//   const [detailId, setDetailId] = useState<string | null>(null);

//   const slot = SLOTS.find((s) => s.id === slotId) as Slot;
//   const past = isSlotPast(date, slot);

//   // 1. Tải phòng (tải lại khi admin đổi trạng thái / sửa phòng)
//   useEffect(() => {
//     let active = true;
//     (async () => {
//       const { data, error } = await supabase.from('rooms').select('*').order('name');
//       if (!active) return;
//       if (error) Alert.alert('Lỗi tải phòng', error.message);
//       else setRooms((data ?? []) as Room[]);
//       setLoading(false);
//     })();
//     return () => {
//       active = false;
//     };
//   }, [roomsTick]);

//   // 2. Tải booking theo ngày + ca
//   useEffect(() => {
//     let active = true;
//     (async () => {
//       const { data, error } = await supabase
//         .from('bookings')
//         .select('room_id, user_id')
//         .eq('booking_date', date)
//         .eq('slot', slotId)
//         .eq('status', 'confirmed');
//       if (!active || error || !data) return;
//       const map: Record<string, string> = {};
//       (data as BookingRow[]).forEach((b) => {
//         map[b.room_id] = b.user_id;
//       });
//       setBooked(map);
//     })();
//     return () => {
//       active = false;
//     };
//   }, [date, slotId, tick]);

//   // 3. Realtime: bookings + rooms
//   useEffect(() => {
//     const channel = supabase
//       .channel('home-live')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () =>
//         setTick((t) => t + 1)
//       )
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () =>
//         setRoomsTick((t) => t + 1)
//       )
//       .subscribe();
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const hasMine = useMemo<boolean>(() => Object.values(booked).includes(userId), [booked, userId]);

//   // 4. Lọc + tìm kiếm ở client
//   const filtered = useMemo<Room[]>(() => {
//     const q = search.trim().toLowerCase();
//     return rooms.filter((r) => {
//       if (q && !r.name.toLowerCase().includes(q) && !r.location.toLowerCase().includes(q)) return false;
//       if (sizeFilter !== 'all' && sizeOf(r.capacity) !== sizeFilter) return false;
//       const isOcc = !!booked[r.id];
//       const maint = r.status === 'maintenance';
//       if (statusFilter === 'available' && (isOcc || maint)) return false;
//       if (statusFilter === 'occupied' && !isOcc) return false;
//       if (statusFilter === 'maintenance' && !maint) return false;
//       return true;
//     });
//   }, [rooms, booked, search, sizeFilter, statusFilter]);

//   const freeCount = useMemo<number>(
//     () => (past ? 0 : rooms.filter((r) => r.status === 'active' && !booked[r.id]).length),
//     [rooms, booked, past]
//   );

//   const detailRoom = useMemo<Room | null>(
//     () => rooms.find((r) => r.id === detailId) ?? null,
//     [rooms, detailId]
//   );

//   const pickDate = (ymd: string) => {
//     setDate(ymd);
//     if (isSlotPast(ymd, slot)) {
//       const next = SLOTS.find((s) => !isSlotPast(ymd, s));
//       if (next) setSlotId(next.id);
//     }
//   };

//   const book = useCallback(
//     (room: Room) => {
//       Alert.alert('Xác nhận đặt phòng', `${room.name}\n${slot.label} (${slot.time})\n${prettyDate(date)}`, [
//         { text: 'Hủy', style: 'cancel' },
//         {
//           text: 'Đặt phòng',
//           onPress: async () => {
//             const { error } = await supabase
//               .from('bookings')
//               .insert({ room_id: room.id, booking_date: date, slot: slotId });
//             if (error) Alert.alert('Không thành công', bookingErrorMessage(error));
//             else Alert.alert('Thành công', 'Bạn đã đặt phòng thành công!');
//             setTick((t) => t + 1);
//           },
//         },
//       ]);
//     },
//     [date, slotId, slot]
//   );

//   const openDetail = useCallback((room: Room) => setDetailId(room.id), []);

//   // FlashList tái sử dụng ô, cần extraData để biết khi nào vẽ lại
//   const extra = useMemo(() => ({ booked, past, hasMine }), [booked, past, hasMine]);

//   const renderItem = useCallback<ListRenderItem<Room>>(
//     ({ item }) => {
//       const mine = booked[item.id] === userId;
//       return (
//         <RoomCard
//           room={item}
//           occupied={!!booked[item.id]}
//           mine={mine}
//           past={past}
//           blocked={hasMine && !mine}
//           onBook={book}
//           onOpen={openDetail}
//         />
//       );
//     },
//     [booked, userId, past, hasMine, book, openDetail]
//   );

//   const header = (
//     <View>
//       <Text style={styles.label}>Chọn ngày</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
//         {DAYS.map((d) => {
//           const ymd = toYMD(d);
//           const active = ymd === date;
//           return (
//             <TouchableOpacity key={ymd} style={[styles.dayBox, active && styles.chipActive]} onPress={() => pickDate(ymd)}>
//               <Text style={[styles.dayWd, active && styles.textWhite]}>{weekday(d)}</Text>
//               <Text style={[styles.dayNum, active && styles.textWhite]}>{d.getDate()}/{d.getMonth() + 1}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>

//       <Text style={styles.label}>Chọn ca</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
//         {SLOTS.map((s) => (
//           <SlotChip
//             key={s.id}
//             slot={s}
//             active={s.id === slotId}
//             disabled={isSlotPast(date, s)}
//             onPress={() => setSlotId(s.id)}
//           />
//         ))}
//       </ScrollView>

//       <Text style={styles.label}>Lọc</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
//         {SIZE_FILTERS.map((f) => (
//           <Chip key={f.key} label={f.label} active={sizeFilter === f.key} onPress={() => setSizeFilter(f.key)} />
//         ))}
//       </ScrollView>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
//         {STATUS_FILTERS.map((f) => (
//           <Chip key={f.key} label={f.label} active={statusFilter === f.key} onPress={() => setStatusFilter(f.key)} />
//         ))}
//       </ScrollView>

//       <View style={styles.summary}>
//         <Text style={styles.summaryTitle}>{prettyDate(date)} · {slot.label} ({slot.time})</Text>
//         <Text style={styles.summarySub}>
//           {past ? 'Ca này đã kết thúc' : `${freeCount} phòng trống · hiển thị ${filtered.length}/${rooms.length}`}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.topBar}>
//         <Text style={styles.title}>VKU - Đặt phòng học</Text>
//         <TextInput
//           style={styles.search}
//           placeholder="🔍 Tìm theo tên phòng hoặc vị trí..."
//           value={search}
//           onChangeText={setSearch}
//         />
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
//       ) : (
//         <FlashList
//           data={filtered}
//           extraData={extra}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           ListHeaderComponent={header}
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
//           ListEmptyComponent={<Text style={styles.empty}>Không có phòng phù hợp.</Text>}
//         />
//       )}

//       {detailRoom && (
//         <RoomDetailModal
//           room={detailRoom}
//           date={date}
//           initialSlot={slotId}
//           userId={userId}
//           onClose={() => setDetailId(null)}
//           onBooked={() => setTick((t) => t + 1)}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   topBar: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
//   title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
//   search: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
//   label: { fontWeight: '800', color: COLORS.text, marginTop: 12, marginBottom: 6 },
//   hRow: { paddingRight: 14, alignItems: 'center', paddingVertical: 2 },
//   chip: {
//     paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff',
//     marginRight: 8, borderWidth: 1, borderColor: '#d1d5db',
//   },
//   chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   chipDisabled: { backgroundColor: COLORS.graySoft, borderColor: '#e5e7eb' },
//   chipText: { color: COLORS.text, fontWeight: '600' },
//   textWhite: { color: '#fff' },
//   textGray: { color: COLORS.gray },
//   dayBox: {
//     width: 64, height: 60, borderRadius: 14, backgroundColor: '#fff', marginRight: 8,
//     alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d1d5db',
//   },
//   dayWd: { color: COLORS.sub, fontSize: 12 },
//   dayNum: { fontWeight: '800', color: COLORS.text, marginTop: 2 },
//   slotChip: {
//     paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#fff',
//     marginRight: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center',
//   },
//   slotLabel: { fontWeight: '800', color: COLORS.text },
//   slotTime: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
//   summary: { marginTop: 14, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: COLORS.primarySoft },
//   summaryTitle: { fontWeight: '800', color: COLORS.primary },
//   summarySub: { color: COLORS.primary, marginTop: 2 },
//   empty: { textAlign: 'center', color: COLORS.sub, marginTop: 30 },
// });
// src/screens/HomeScreen.tsx

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';

import RoomCard from '../components/RoomCard';
import RoomDetailModal from '../components/RoomDetailModal';
import { COLORS, SLOTS } from '../constants';
import { useBookingsForSlot } from '../hooks/useBookingsForSlot';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { useRooms } from '../hooks/useRooms';
import {
  defaultSelection,
  isSlotPast,
  nextDays,
  prettyDate,
  toYMD,
  weekday,
} from '../lib/dates';
import { bookingErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { Room, Slot } from '../types';

type SizeFilter = 'all' | 'small' | 'medium' | 'large';

type StatusFilter =
  | 'all'
  | 'available'
  | 'occupied'
  | 'maintenance';

const DAYS = nextDays(14);

const SIZE_FILTERS: {
  key: SizeFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Mọi kích cỡ' },
  { key: 'small', label: 'Nhỏ ≤30' },
  { key: 'medium', label: 'Vừa 31-60' },
  { key: 'large', label: 'Lớn >60' },
];

const STATUS_FILTERS: {
  key: StatusFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'maintenance', label: 'Bảo trì' },
];

const sizeOf = (
  c: number
): Exclude<SizeFilter, 'all'> =>
  c <= 30 ? 'small' : c <= 60 ? 'medium' : 'large';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.chip,
          active && styles.chipActive,
        ]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <Text
          style={[
            styles.chipText,
            active && styles.textWhite,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function SlotChip({
  slot,
  active,
  disabled,
  onPress,
}: {
  slot: Slot;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          styles.slotChip,
          active && styles.chipActive,
          disabled && styles.chipDisabled,
        ]}
      >
        <Text
          style={[
            styles.slotLabel,
            active && styles.textWhite,
            disabled && styles.textGray,
          ]}
        >
          {slot.label}
        </Text>

        <Text
          style={[
            styles.slotTime,
            active && styles.textWhite,
            disabled && styles.textGray,
          ]}
        >
          {slot.time}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({
  userId,
}: {
  userId: string;
}) {
  const queryClient = useQueryClient();
  const createBooking = useCreateBooking();
  const isBooking = createBooking.isPending;

  const [date, setDate] = useState<string>(
    () => defaultSelection().date
  );

  const [slotId, setSlotId] = useState<number>(
    () => defaultSelection().slotId
  );

  const [search, setSearch] = useState<string>('');

  const [sizeFilter, setSizeFilter] =
    useState<SizeFilter>('all');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const [detailId, setDetailId] =
    useState<string | null>(null);

  const {
    data: rooms = [],
    isLoading: loading,
  } = useRooms();

  const {
    data: bookingRows = [],
  } = useBookingsForSlot(date, slotId);

  const booked = useMemo<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};

      bookingRows.forEach((booking) => {
        map[booking.room_id] = booking.user_id;
      });

      return map;
    },
    [bookingRows]
  );

  const slot = SLOTS.find(
    (s) => s.id === slotId
  ) as Slot;

  const past = isSlotPast(date, slot);

  useEffect(() => {
    const channel = supabase
      .channel('home-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['bookings', date, slotId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['rooms'],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, date, slotId]);

  const hasMine = useMemo<boolean>(
    () => Object.values(booked).includes(userId),
    [booked, userId]
  );

  const filtered = useMemo<Room[]>(() => {
    const q = search.trim().toLowerCase();

    return rooms.filter((r) => {
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !r.location.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (
        sizeFilter !== 'all' &&
        sizeOf(r.capacity) !== sizeFilter
      ) {
        return false;
      }

      const isOcc = !!booked[r.id];
      const maint = r.status === 'maintenance';

      if (
        statusFilter === 'available' &&
        (isOcc || maint)
      ) {
        return false;
      }

      if (
        statusFilter === 'occupied' &&
        !isOcc
      ) {
        return false;
      }

      if (
        statusFilter === 'maintenance' &&
        !maint
      ) {
        return false;
      }

      return true;
    });
  }, [
    rooms,
    booked,
    search,
    sizeFilter,
    statusFilter,
  ]);

  const freeCount = useMemo<number>(
    () =>
      past
        ? 0
        : rooms.filter(
            (r) =>
              r.status === 'active' &&
              !booked[r.id]
          ).length,
    [rooms, booked, past]
  );

  const detailRoom = useMemo<Room | null>(
    () =>
      rooms.find((r) => r.id === detailId) ??
      null,
    [rooms, detailId]
  );

  const pickDate = (ymd: string) => {
    setDate(ymd);

    if (isSlotPast(ymd, slot)) {
      const next = SLOTS.find(
        (s) => !isSlotPast(ymd, s)
      );

      if (next) {
        setSlotId(next.id);
      }
    }
  };

 const book = useCallback(
  (room: Room) => {
    if (isBooking) {
        return;
      }

    Alert.alert(
      'Xác nhận đặt phòng',
      `${room.name}\n${slot.label} (${slot.time})\n${prettyDate(
        date
      )}`,
      [
        {
          text: 'Hủy', style: 'cancel',
        },
        {
          text: 'Đặt phòng',
          onPress: async () => {
            try {
              await createBooking.mutateAsync({
                roomId: room.id,
                bookingDate: date,
                slotId,
              });

              Alert.alert(
                'Thành công', 'Bạn đã đặt phòng thành công!'
              );
            } catch (error) {
              Alert.alert(
                'Không thành công',
                bookingErrorMessage(error as Error)
              );
            }
          },
        },
      ]
    );
  },
  [
    createBooking, date, slot, slotId, ]
);

  const openDetail = useCallback(
    (room: Room) => {
      setDetailId(room.id);
    },
    []
  );

  const extra = useMemo(
    () => ({
      booked,
      past,
      hasMine,
    }),
    [booked, past, hasMine]
  );

  const renderItem =
    useCallback<ListRenderItem<Room>>(
      ({ item }) => {
        const mine =
          booked[item.id] === userId;

        return (
          <RoomCard
            room={item}
            occupied={!!booked[item.id]}
            mine={mine}
            past={past}
            blocked={hasMine && !mine}
            onBook={book}
            onOpen={openDetail}
          />
        );
      },
      [
        booked,
        userId,
        past,
        hasMine,
        book,
        openDetail,
      ]
    );

  const header = (
    <View>
      <Animated.View
        entering={FadeInDown.duration(400)}
      >
        <Text style={styles.label}>
          Chọn ngày
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {DAYS.map((d) => {
            const ymd = toYMD(d);
            const active = ymd === date;

            return (
              <Pressable
                key={ymd}
                style={[
                  styles.dayBox,
                  active && styles.chipActive,
                ]}
                onPress={() => pickDate(ymd)}
              >
                <Text
                  style={[
                    styles.dayWd,
                    active && styles.textWhite,
                  ]}
                >
                  {weekday(d)}
                </Text>

                <Text
                  style={[
                    styles.dayNum,
                    active && styles.textWhite,
                  ]}
                >
                  {d.getDate()}/{d.getMonth() + 1}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(70).duration(400)}
      >
        <Text style={styles.label}>
          Chọn ca
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {SLOTS.map((s) => (
            <SlotChip
              key={s.id}
              slot={s}
              active={s.id === slotId}
              disabled={isSlotPast(date, s)}
              onPress={() => setSlotId(s.id)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(140).duration(400)}
      >
        <Text style={styles.label}>
          Lọc kích cỡ
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {SIZE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={sizeFilter === f.key}
              onPress={() =>
                setSizeFilter(f.key)
              }
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>
          Trạng thái
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={
                statusFilter === f.key
              }
              onPress={() =>
                setStatusFilter(f.key)
              }
            />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(180).duration(450)}
        style={styles.summary}
      >
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryIconText}>
            📅
          </Text>
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>
            {prettyDate(date)}
          </Text>

          <Text style={styles.summarySlot}>
            {slot.label} · {slot.time}
          </Text>

          <Text style={styles.summarySub}>
            {past
              ? 'Ca này đã kết thúc'
              : `${freeCount} phòng trống · hiển thị ${filtered.length}/${rooms.length}`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.duration(450)}
        style={styles.topBar}
      >
        <Text style={styles.title}>
          VKU - Đặt phòng học
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>
            🔍
          </Text>

          <TextInput
            style={styles.search}
            placeholder="Tìm theo tên phòng hoặc vị trí..."
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </Animated.View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Đang tải danh sách phòng...
          </Text>
        </View>
      ) : (
        <FlashList
          data={filtered}
          extraData={extra}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: 20,
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>
                🏫
              </Text>

              <Text style={styles.empty}>
                Không có phòng phù hợp.
              </Text>
            </View>
          }
        />
      )}

      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          date={date}
          initialSlot={slotId}
          userId={userId}
          onClose={() => setDetailId(null)}
          onBooked={() => {
            queryClient.invalidateQueries({
              queryKey: ['bookings', date, slotId],
            });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 9 },
  title: { fontSize: 25, fontWeight: '900', color: '#172033', marginBottom: 12, letterSpacing: -0.4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 13, shadowColor: '#0f172a', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchIcon: { fontSize: 16, marginRight: 8, opacity: 0.75 },
  search: { flex: 1, paddingVertical: 13, color: '#172033', fontSize: 14 },
  label: { fontWeight: '800', color: '#334155', marginTop: 14, marginBottom: 8, fontSize: 13 },
  hRow: { paddingRight: 16, alignItems: 'center', paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#dbe2ea' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  chipDisabled: { backgroundColor: '#eef1f5', borderColor: '#e2e6eb' },
  chipText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  textWhite: { color: '#fff' },
  textGray: { color: '#a1aab8' },
  dayBox: { width: 70, height: 64, borderRadius: 16, backgroundColor: '#fff', marginRight: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbe2ea', shadowColor: '#0f172a', shadowOpacity: 0.035, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  dayWd: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  dayNum: { fontWeight: '900', color: '#172033', marginTop: 4, fontSize: 14 },
  slotChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 15, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#dbe2ea', alignItems: 'center', shadowColor: '#0f172a', shadowOpacity: 0.025, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  slotLabel: { fontWeight: '900', color: '#334155', fontSize: 13 },
  slotTime: { fontSize: 11, color: '#64748b', marginTop: 3 },
  summary: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: '#eaf2ff', borderWidth: 1, borderColor: '#d2e3ff', shadowColor: '#2563eb', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  summaryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, shadowColor: '#2563eb', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  summaryIconText: { fontSize: 20 },
  summaryContent: { flex: 1 },
  summaryTitle: { fontWeight: '900', color: '#1d4ed8', fontSize: 14 },
  summarySlot: { color: '#2563eb', fontWeight: '800', marginTop: 3, fontSize: 13 },
  summarySub: { color: '#5b78a5', marginTop: 4, fontSize: 12, fontWeight: '600' },
  loading: { alignItems: 'center', marginTop: 55 },
  loadingText: { color: '#64748b', marginTop: 11, fontSize: 13, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 42, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 42, marginBottom: 10 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 5, fontSize: 14, fontWeight: '600' },
});