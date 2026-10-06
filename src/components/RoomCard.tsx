// // import React from 'react';
// // import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import React from 'react';
// import {
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Animated, {
//   FadeInDown,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { COLORS } from '../constants';
// import { Room } from '../types';

// interface Props {
//   room: Room;
//   occupied: boolean;
//   mine: boolean;
//   past: boolean;
//   blocked: boolean; // mình đã đặt phòng khác trong ca này
//   onBook: (room: Room) => void;
//   onOpen: (room: Room) => void;
// }

// function RoomCard({ room, occupied, mine, past, blocked, onBook, onOpen }: Props) {
//   const maintenance = room.status === 'maintenance';

//   let badgeText = 'Available';
//   let badgeColor: string = COLORS.green;
//   if (maintenance) {
//     badgeText = 'Bảo trì';
//     badgeColor = COLORS.orange;
//   } else if (occupied) {
//     badgeText = 'Occupied';
//     badgeColor = COLORS.red;
//   } else if (past) {
//     badgeText = 'Đã qua';
//     badgeColor = COLORS.gray;
//   }

//   //new
//   const scale = useSharedValue(1);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const pressIn = () => {
//     scale.value = withSpring(0.97);
//   };

//   const pressOut = () => {
//     scale.value = withSpring(1);
//   };

//   const canBook = !maintenance && !occupied && !past && !blocked;
//   const reason = maintenance
//     ? 'Đang bảo trì'
//     : mine
//     ? '✔ Bạn đã đặt'
//     : occupied
//     ? 'Đã có người đặt'
//     : past
//     ? 'Ca đã kết thúc'
//     : 'Bạn đã có phòng ca này';

//   return (
//     <Animated.View 
//       entering={FadeInDown.duration(450)}
//         style={[styles.card, animatedStyle]}>

//       <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={() => onOpen(room)}>
//         <View>
//           <Image source={{ uri: room.image_url ?? undefined }} style={styles.image} />
//           <View style={[styles.badge, { backgroundColor: badgeColor }]}>
//             <Text style={styles.badgeText}>{badgeText}</Text>
//           </View>
//         </View>

//         <View style={styles.body}>
//           <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
//           <View style={styles.metaRow}>
//             <Text style={styles.meta}>📍 {room.location}</Text>
//             <Text style={styles.meta}>👥 {room.capacity} chỗ</Text>
//           </View>

//           <View style={styles.actions}>
//             <TouchableOpacity style={styles.detailBtn} onPress={() => onOpen(room)}>
//               <Text style={styles.detailText}>Chi tiết</Text>
//             </TouchableOpacity>

//             {canBook ? (
//               <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(room)}>
//                 <Text style={styles.bookText}>Booking</Text>
//               </TouchableOpacity>
//             ) : (
//               <View style={[styles.bookBtn, styles.bookDisabled]}>
//                 <Text style={[styles.bookText, { color: COLORS.sub }]}>{reason}</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//    </Animated.View>
//   );
// }

// export default React.memo(RoomCard);

// const styles = StyleSheet.create({
//   // iOS: không dùng overflow hidden trên card để bóng không bị cắt
//   card: {
//     backgroundColor: COLORS.card,
//     borderRadius: 16,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 2,
//   },
//   image: {
//     width: '100%',
//     height: 160,
//     backgroundColor: '#e5e7eb',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   badge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
//   badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
//   body: { padding: 14 },
//   name: { fontSize: 18, fontWeight: '800', color: COLORS.text },
//   metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
//   meta: { color: COLORS.sub },
//   actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
//   detailBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
//   detailText: { color: COLORS.primary, fontWeight: '700' },
//   bookBtn: { flex: 1.3, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.primary },
//   bookDisabled: { backgroundColor: COLORS.graySoft },
//   bookText: { color: '#fff', fontWeight: '700' },
// });
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated';
import { COLORS } from '../constants';
import { Room } from '../types';

interface Props {
  room: Room;
  occupied: boolean;
  mine: boolean;
  past: boolean;
  blocked: boolean;
  onBook: (room: Room) => void;
  onOpen: (room: Room) => void;
}

function RoomCard({
  room,
  occupied,
  mine,
  past,
  blocked,
  onBook,
  onOpen,
}: Props) {
  const maintenance = room.status === 'maintenance';

let badgeText = 'Available';
let badgeColor: string = COLORS.green;

if (maintenance) {
  badgeText = 'Bảo trì';
  badgeColor = COLORS.orange;
} else if (occupied) {
  badgeText = 'Occupied';
  badgeColor = COLORS.red;
} else if (past) {
  badgeText = 'Đã qua';
  badgeColor = COLORS.gray;
}
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const canBook =
    !maintenance &&
    !occupied &&
    !past &&
    !blocked;

  const reason = maintenance
    ? 'Đang bảo trì'
    : mine
    ? '✔ Bạn đã đặt'
    : occupied
    ? 'Đã có người đặt'
    : past
    ? 'Ca đã kết thúc'
    : 'Bạn đã có phòng ca này';

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={styles.wrapper}
    >
      <Animated.View style={animatedStyle}>
        <View style={styles.card}>
          <Pressable
            onPress={() => onOpen(room)}
            onPressIn={() => {
              scale.value = withSpring(0.975);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: room.image_url ?? undefined,
                }}
                style={styles.image}
              />

              <View style={styles.imageOverlay} />

              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeColor },
                ]}
              >
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>
                  {badgeText}
                </Text>
              </View>

              <View style={styles.capacityBadge}>
                <Text style={styles.capacityBadgeText}>
                  👥 {room.capacity}
                </Text>
              </View>

              <View style={styles.imageTitle}>
                <Text
                  style={styles.imageRoomName}
                  numberOfLines={1}
                >
                  {room.name}
                </Text>

                <Text
                  style={styles.imageLocation}
                  numberOfLines={1}
                >
                  📍 {room.location}
                </Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.body}>
            <View style={styles.infoTop}>
              <View style={styles.roomType}>
                <Text style={styles.roomTypeIcon}>
                  🏫
                </Text>

                <Text style={styles.roomTypeText}>
                  Phòng học VKU
                </Text>
              </View>

              {mine && (
                <View style={styles.mineChip}>
                  <Text style={styles.mineChipText}>
                    ✓ Đã đặt
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Text>👥</Text>
                </View>

                <View>
                  <Text style={styles.detailLabel}>
                    Sức chứa
                  </Text>

                  <Text style={styles.detailValue}>
                    {room.capacity} chỗ
                  </Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Text>📍</Text>
                </View>

                <View style={styles.locationContent}>
                  <Text style={styles.detailLabel}>
                    Vị trí
                  </Text>

                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    {room.location}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.detailBtn,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onOpen(room)}
              >
                <Text style={styles.detailIconText}>
                  ⓘ
                </Text>

                <Text style={styles.detailText}>
                  Chi tiết
                </Text>
              </Pressable>

              {canBook ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.bookBtn,
                    pressed && styles.bookPressed,
                  ]}
                  onPress={() => onBook(room)}
                >
                  <Text style={styles.bookIcon}>
                    ✓
                  </Text>

                  <Text style={styles.bookText}>
                    Đặt phòng
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.bookBtn,
                    styles.bookDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.bookText,
                      styles.disabledText,
                    ]}
                    numberOfLines={1}
                  >
                    {reason}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default React.memo(RoomCard);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#1e40af', shadowOpacity: 0.11, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
  imageContainer: { position: 'relative', height: 195, backgroundColor: '#dbeafe' },
  image: { width: '100%', height: '100%', backgroundColor: '#dbeafe' },
  imageOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 125, backgroundColor: 'rgba(15,23,42,0.55)' },
  badge: { position: 'absolute', top: 13, right: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  capacityBadge: { position: 'absolute', top: 13, left: 13, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  capacityBadgeText: { color: '#334155', fontSize: 11, fontWeight: '900' },
  imageTitle: { position: 'absolute', left: 16, right: 16, bottom: 15 },
  imageRoomName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  imageLocation: { color: '#e2e8f0', fontSize: 12, fontWeight: '700', marginTop: 5 },
  body: { padding: 16 },
  infoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  roomType: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11 },
  roomTypeIcon: { fontSize: 13, marginRight: 6 },
  roomTypeText: { color: '#2563eb', fontSize: 11, fontWeight: '900' },
  mineChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11 },
  mineChipText: { color: '#15803d', fontSize: 11, fontWeight: '900' },
  detailRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#eef2f7', borderRadius: 17, paddingVertical: 12, paddingHorizontal: 11 },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  detailIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#eaf2ff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  detailLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700' },
  detailValue: { color: '#1e293b', fontSize: 12, fontWeight: '900', marginTop: 3 },
  locationContent: { flex: 1 },
  detailDivider: { width: 1, height: 36, backgroundColor: '#e2e8f0', marginHorizontal: 9 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  detailBtn: { flex: 1, minHeight: 47, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.2, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  detailIconText: { color: '#2563eb', fontSize: 16, fontWeight: '900', marginRight: 6 },
  detailText: { color: '#2563eb', fontWeight: '900', fontSize: 13 },
  bookBtn: { flex: 1.3, minHeight: 47, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingHorizontal: 8, shadowColor: '#2563eb', shadowOpacity: 0.25, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  bookIcon: { color: '#fff', fontSize: 15, fontWeight: '900', marginRight: 6 },
  bookPressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  buttonPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  bookDisabled: { backgroundColor: '#eef1f5', shadowOpacity: 0, elevation: 0 },
  bookText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  disabledText: { color: '#64748b', fontSize: 11 },
});