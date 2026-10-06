// import { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Image,
//     Modal,
//     Platform,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { COLORS, SLOTS } from '../constants';
// import { isSlotPast, prettyDate } from '../lib/dates';
// import { bookingErrorMessage } from '../lib/errors';
// import { supabase } from '../lib/supabase';
// import { Room, Slot, SlotState } from '../types';

// interface Props {
//   room: Room;
//   date: string;
//   initialSlot: number;
//   userId: string;
//   onClose: () => void;
//   onBooked?: () => void;
// }

// interface SlotRow {
//   slot: number;
//   user_id: string;
// }

// const PILL: Record<SlotState, { t: string; bg: string; c: string }> = {
//   free: { t: 'Trống', bg: COLORS.greenSoft, c: COLORS.green },
//   mine: { t: 'Bạn đã đặt', bg: COLORS.primarySoft, c: COLORS.primary },
//   occupied: { t: 'Đã có người đặt', bg: COLORS.redSoft, c: COLORS.red },
//   past: { t: 'Đã qua', bg: COLORS.graySoft, c: COLORS.gray },
//   maintenance: { t: 'Bảo trì', bg: COLORS.orangeSoft, c: COLORS.orange },
// };

// const BUTTON: Record<SlotState, { text: string; disabled: boolean }> = {
//   free: { text: 'Booking', disabled: false },
//   mine: { text: '✔ Bạn đã đặt ca này', disabled: true },
//   occupied: { text: 'Ca đã có người đặt', disabled: true },
//   past: { text: 'Ca đã kết thúc', disabled: true },
//   maintenance: { text: 'Phòng đang bảo trì', disabled: true },
// };

// export default function RoomDetailModal({ room, date, initialSlot, userId, onClose, onBooked }: Props) {
//   const insets = useSafeAreaInsets();
//   const [slotId, setSlotId] = useState<number>(initialSlot);
//   const [dayBookings, setDayBookings] = useState<Record<number, string>>({});
//   const [loading, setLoading] = useState<boolean>(true);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [tick, setTick] = useState<number>(0);

//   const closeTop = Platform.OS === 'ios' ? insets.top + 8 : (StatusBar.currentHeight ?? 24) + 8;

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       const { data, error } = await supabase
//         .from('bookings')
//         .select('slot, user_id')
//         .eq('room_id', room.id)
//         .eq('booking_date', date)
//         .eq('status', 'confirmed');
//       if (!active) return;
//       if (!error && data) {
//         const map: Record<number, string> = {};
//         (data as SlotRow[]).forEach((b) => {
//           map[b.slot] = b.user_id;
//         });
//         setDayBookings(map);
//       }
//       setLoading(false);
//     })();
//     return () => {
//       active = false;
//     };
//   }, [room.id, date, tick]);

//   useEffect(() => {
//     const channel = supabase
//       .channel(`room-detail-${room.id}`)
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () =>
//         setTick((t) => t + 1)
//       )
//       .subscribe();
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [room.id]);

//   const stateOf = (s: Slot): SlotState => {
//     if (room.status === 'maintenance') return 'maintenance';
//     if (isSlotPast(date, s)) return 'past';
//     const u = dayBookings[s.id];
//     if (!u) return 'free';
//     return u === userId ? 'mine' : 'occupied';
//   };

//   const selected = SLOTS.find((s) => s.id === slotId) as Slot;
//   const btn = BUTTON[stateOf(selected)];

//   const book = async () => {
//     if (saving) return;
//     setSaving(true);
//     const { error } = await supabase
//       .from('bookings')
//       .insert({ room_id: room.id, booking_date: date, slot: slotId });
//     setSaving(false);

//     if (error) {
//       Alert.alert('Không thành công', bookingErrorMessage(error));
//     } else {
//       Alert.alert('Thành công', `Đã đặt ${room.name} - ${selected.label}.`, [
//         { text: 'OK', onPress: onClose },
//       ]);
//     }
//     setTick((t) => t + 1);
//     onBooked?.();
//   };

//   return (
//     <Modal visible animationType="slide" statusBarTranslucent onRequestClose={onClose}>
//       <View style={styles.container}>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Image source={{ uri: room.image_url ?? undefined }} style={styles.image} />

//           <View style={styles.sheet}>
//             <Text style={styles.name}>{room.name}</Text>
//             <Text style={styles.line}>📍 {room.location}</Text>
//             <Text style={styles.line}>👥 Sức chứa: {room.capacity} người</Text>
//             {room.status === 'maintenance' && (
//               <View style={styles.maintBox}>
//                 <Text style={styles.maintText}>🛠 Phòng đang bảo trì, tạm thời không nhận đặt.</Text>
//               </View>
//             )}

//             <Text style={styles.section}>Mô tả</Text>
//             <Text style={styles.desc}>{room.description || 'Chưa có mô tả cho phòng này.'}</Text>

//             {(room.equipment ?? []).length > 0 && (
//               <>
//                 <Text style={styles.section}>Thiết bị & tiện ích</Text>
//                 <View style={styles.tags}>
//                   {(room.equipment ?? []).map((e) => (
//                     <View key={e} style={styles.tag}>
//                       <Text style={styles.tagText}>{e}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </>
//             )}

//             <Text style={styles.section}>Lịch phòng · {prettyDate(date)}</Text>
//             {loading ? (
//               <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
//             ) : (
//               SLOTS.map((s) => {
//                 const pill = PILL[stateOf(s)];
//                 const active = s.id === slotId;
//                 return (
//                   <TouchableOpacity
//                     key={s.id}
//                     style={[styles.slotRow, active && styles.slotActive]}
//                     onPress={() => setSlotId(s.id)}
//                   >
//                     <View>
//                       <Text style={styles.slotLabel}>{s.label}</Text>
//                       <Text style={styles.slotTime}>{s.time}</Text>
//                     </View>
//                     <View style={[styles.pill, { backgroundColor: pill.bg }]}>
//                       <Text style={[styles.pillText, { color: pill.c }]}>{pill.t}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })
//             )}
//             <View style={{ height: 110 }} />
//           </View>
//         </ScrollView>

//         <TouchableOpacity style={[styles.closeBtn, { top: closeTop }]} onPress={onClose}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>

//         <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.barTitle}>{selected.label} · {selected.time}</Text>
//             <Text style={styles.barSub}>{prettyDate(date)}</Text>
//           </View>
//           <TouchableOpacity
//             style={[styles.bookBtn, btn.disabled && styles.bookDisabled]}
//             disabled={btn.disabled || saving}
//             onPress={book}
//           >
//             {saving ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={[styles.bookText, btn.disabled && { color: COLORS.sub }]}>{btn.text}</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   image: { width: '100%', height: 260, backgroundColor: '#e5e7eb' },
//   sheet: { marginTop: -22, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 },
//   name: { fontSize: 24, fontWeight: '800', color: COLORS.text },
//   line: { color: COLORS.sub, marginTop: 6, fontSize: 15 },
//   maintBox: { marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: COLORS.orangeSoft },
//   maintText: { color: COLORS.orange, fontWeight: '700' },
//   section: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 8 },
//   desc: { color: COLORS.text, lineHeight: 21 },
//   tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
//   tag: { backgroundColor: COLORS.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
//   tagText: { color: COLORS.primary, fontWeight: '600' },
//   slotRow: {
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 8,
//   },
//   slotActive: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
//   slotLabel: { fontWeight: '700', color: COLORS.text },
//   slotTime: { color: COLORS.sub, marginTop: 2 },
//   pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
//   pillText: { fontWeight: '700', fontSize: 12 },
//   closeBtn: {
//     position: 'absolute', left: 14, width: 40, height: 40, borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center',
//     shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4,
//   },
//   closeText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
//   bottomBar: {
//     position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12,
//     backgroundColor: '#fff', paddingTop: 14, paddingHorizontal: 14, borderTopWidth: 1, borderColor: '#e5e7eb',
//   },
//   barTitle: { fontWeight: '800', color: COLORS.text },
//   barSub: { color: COLORS.sub, marginTop: 2 },
//   bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 12, minWidth: 150, alignItems: 'center' },
//   bookDisabled: { backgroundColor: COLORS.graySoft },
//   bookText: { color: '#fff', fontWeight: '800' },
// });
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SLOTS } from '../constants';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { isSlotPast, prettyDate } from '../lib/dates';
import { bookingErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { Room, Slot, SlotState } from '../types';

interface Props {
  room: Room;
  date: string;
  initialSlot: number;
  userId: string;
  onClose: () => void;
  onBooked?: () => void;
}

interface SlotRow {
  slot: number;
  user_id: string;
}

const PILL: Record<
  SlotState,
  { t: string; bg: string; c: string }
> = {
  free: {
    t: 'Trống',
    bg: COLORS.greenSoft,
    c: COLORS.green,
  },
  mine: {
    t: 'Bạn đã đặt',
    bg: COLORS.primarySoft,
    c: COLORS.primary,
  },
  occupied: {
    t: 'Đã có người đặt',
    bg: COLORS.redSoft,
    c: COLORS.red,
  },
  past: {
    t: 'Đã qua',
    bg: COLORS.graySoft,
    c: COLORS.gray,
  },
  maintenance: {
    t: 'Bảo trì',
    bg: COLORS.orangeSoft,
    c: COLORS.orange,
  },
};

const BUTTON: Record<
  SlotState,
  { text: string; disabled: boolean }
> = {
  free: {
    text: 'Đặt phòng',
    disabled: false,
  },
  mine: {
    text: '✔ Bạn đã đặt ca này',
    disabled: true,
  },
  occupied: {
    text: 'Ca đã có người đặt',
    disabled: true,
  },
  past: {
    text: 'Ca đã kết thúc',
    disabled: true,
  },
  maintenance: {
    text: 'Phòng đang bảo trì',
    disabled: true,
  },
};

export default function RoomDetailModal({
  room,
  date,
  initialSlot,
  userId,
  onClose,
  onBooked,
}: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const createBooking = useCreateBooking();
  const saving = createBooking.isPending;

  const [slotId, setSlotId] =
    useState<number>(initialSlot);

  // const [saving, setSaving] =
  //   useState<boolean>(false);

  const selectedScale = useSharedValue(1);

  const selectedAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: selectedScale.value,
        },
      ],
    }));

  const closeTop =
    Platform.OS === 'ios'
      ? insets.top + 8
      : (StatusBar.currentHeight ?? 24) + 8;

  const {
    data: bookingRows = [],
    isLoading: loading,
  } = useQuery<SlotRow[], Error>({
    queryKey: [
      'room-bookings',
      room.id,
      date,
    ],

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from('bookings')
          .select('slot, user_id')
          .eq('room_id', room.id)
          .eq('booking_date', date)
          .eq('status', 'confirmed');

      if (error) {
        throw error;
      }

      return (data ?? []) as SlotRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`room-detail-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              'room-bookings',
              room.id,
              date,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              'bookings',
              date,
              slotId,
            ],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    queryClient,
    room.id,
    date,
    slotId,
  ]);

  const dayBookings =
    bookingRows.reduce<Record<number, string>>(
      (map, booking) => {
        map[booking.slot] =
          booking.user_id;

        return map;
      },
      {}
    );

  const stateOf = (s: Slot): SlotState => {
    if (room.status === 'maintenance') {
      return 'maintenance';
    }

    if (isSlotPast(date, s)) {
      return 'past';
    }

    const u = dayBookings[s.id];

    if (!u) {
      return 'free';
    }

    return u === userId
      ? 'mine'
      : 'occupied';
  };

  const selected =
    SLOTS.find(
      (s) => s.id === slotId
    ) as Slot;

  const selectedState =
    stateOf(selected);

  const btn = BUTTON[selectedState];

  const selectSlot = (id: number) => {
    setSlotId(id);

    selectedScale.value = 0.96;

    selectedScale.value = withSpring(1, {
      damping: 12,
      stiffness: 220,
    });
  };

  const book = async () => {
    if (saving) {
      return;
    }

    try {
      await createBooking.mutateAsync({
        roomId: room.id,
        bookingDate: date,
        slotId,
      });

      onBooked?.();

      Alert.alert(
        'Đặt phòng thành công',
        `Đã đặt ${room.name} - ${selected.label}.`,
        [
          {
            text: 'OK',
            onPress: onClose,
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Không thành công',
        bookingErrorMessage(error as Error)
      );
    }
  };
  

  return (
    <Modal
      visible
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <Animated.View
            entering={FadeIn.duration(400)}
          >
            <Image
              source={{
                uri:
                  room.image_url ??
                  undefined,
              }}
              style={styles.image}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(400)}
            style={styles.sheet}
          >
            <View style={styles.handle} />

            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {room.name}
                </Text>

                <Text style={styles.line}>
                  📍 {room.location}
                </Text>

                <Text style={styles.line}>
                  👥 Sức chứa: {room.capacity}{' '}
                  người
                </Text>
              </View>

              <View style={styles.roomIcon}>
                <Text
                  style={
                    styles.roomIconText
                  }
                >
                  🏫
                </Text>
              </View>
            </View>

            {room.status ===
              'maintenance' && (
              <Animated.View
                entering={FadeInDown.duration(
                  300
                )}
                style={styles.maintBox}
              >
                <Text
                  style={styles.maintIcon}
                >
                  🛠
                </Text>

                <Text
                  style={styles.maintText}
                >
                  Phòng đang bảo trì, tạm thời
                  không nhận đặt.
                </Text>
              </Animated.View>
            )}

            <Text style={styles.section}>
              Mô tả
            </Text>

            <Text style={styles.desc}>
              {room.description ||
                'Chưa có mô tả cho phòng này.'}
            </Text>

            {(room.equipment ?? [])
              .length > 0 && (
              <>
                <Text
                  style={styles.section}
                >
                  Thiết bị & tiện ích
                </Text>

                <View style={styles.tags}>
                  {(room.equipment ?? []).map(
                    (e, index) => (
                      <Animated.View
                        key={e}
                        entering={FadeInDown
                          .delay(
                            index * 45
                          )
                          .duration(250)}
                        style={styles.tag}
                      >
                        <Text
                          style={
                            styles.tagText
                          }
                        >
                          {e}
                        </Text>
                      </Animated.View>
                    )
                  )}
                </View>
              </>
            )}

            <Text style={styles.section}>
              Lịch phòng
            </Text>

            <Text style={styles.dateText}>
              {prettyDate(date)}
            </Text>

            {loading ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{
                  marginVertical: 25,
                }}
              />
            ) : (
              SLOTS.map((s, index) => {
                const pill =
                  PILL[stateOf(s)];

                const active =
                  s.id === slotId;

                return (
                  <Animated.View
                    key={s.id}
                    entering={FadeInDown
                      .delay(index * 50)
                      .duration(280)}
                  >
                    <Animated.View
                      style={
                        active
                          ? selectedAnimatedStyle
                          : undefined
                      }
                    >
                      <Pressable
                        style={[
                          styles.slotRow,
                          active &&
                            styles.slotActive,
                        ]}
                        onPress={() =>
                          selectSlot(
                            s.id
                          )
                        }
                      >
                        <View>
                          <Text
                            style={
                              styles.slotLabel
                            }
                          >
                            {s.label}
                          </Text>

                          <Text
                            style={
                              styles.slotTime
                            }
                          >
                            {s.time}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.pill,
                            {
                              backgroundColor:
                                pill.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              {
                                color:
                                  pill.c,
                              },
                            ]}
                          >
                            {pill.t}
                          </Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                  </Animated.View>
                );
              })
            )}

            <View style={{ height: 125 }} />
          </Animated.View>
        </ScrollView>

        <Pressable
          style={[
            styles.closeBtn,
            {
              top: closeTop,
            },
          ]}
          onPress={onClose}
        >
          <Text style={styles.closeText}>
            ✕
          </Text>
        </Pressable>

        <Animated.View
          entering={FadeInUp.duration(350)}
          style={[
            styles.bottomBar,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  12
                ) + 10,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.barTitle}>
              {selected.label} ·{' '}
              {selected.time}
            </Text>

            <Text style={styles.barSub}>
              {prettyDate(date)}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.bookBtn,
              btn.disabled &&
                styles.bookDisabled,
              pressed &&
                !btn.disabled &&
                styles.bookPressed,
            ]}
            disabled={
              btn.disabled || saving
            }
            onPress={book}
          >
            {saving ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={[
                  styles.bookText,
                  btn.disabled && {
                    color: COLORS.sub,
                  },
                ]}
              >
                {btn.text}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },
  image: { width: '100%', height: 270, backgroundColor: '#e5e7eb' },
  sheet: { marginTop: -24, backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 19 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  line: { color: COLORS.sub, marginTop: 7, fontSize: 14 },
  roomIcon: { width: 55, height: 55, borderRadius: 18, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  roomIconText: { fontSize: 26 },
  maintBox: { flexDirection: 'row', alignItems: 'center', marginTop: 15, padding: 13, borderRadius: 14, backgroundColor: COLORS.orangeSoft },
  maintIcon: { fontSize: 18, marginRight: 8 },
  maintText: { flex: 1, color: COLORS.orange, fontWeight: '700', lineHeight: 19 },
  section: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginTop: 22, marginBottom: 8 },
  dateText: { color: COLORS.primary, fontWeight: '700', marginBottom: 10 },
  desc: { color: COLORS.sub, lineHeight: 21, fontSize: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: COLORS.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  tagText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderRadius: 15, borderWidth: 1.4, borderColor: '#e5e7eb', marginBottom: 9, backgroundColor: '#fff' },
  slotActive: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
  slotLabel: { fontWeight: '800', color: COLORS.text, fontSize: 14 },
  slotTime: { color: COLORS.sub, marginTop: 3, fontSize: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  pillText: { fontWeight: '800', fontSize: 11 },
  closeBtn: { position: 'absolute', left: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  closeText: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', paddingTop: 14, paddingHorizontal: 14, borderTopWidth: 1, borderColor: '#e5e7eb' },
  barTitle: { fontWeight: '900', color: COLORS.text, fontSize: 13 },
  barSub: { color: COLORS.sub, marginTop: 3, fontSize: 12 },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 19, paddingVertical: 13, borderRadius: 14, minWidth: 145, alignItems: 'center' },
  bookPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  bookDisabled: { backgroundColor: COLORS.graySoft },
  bookText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});