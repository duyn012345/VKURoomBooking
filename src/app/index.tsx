// import type { Session } from '@supabase/supabase-js';
// import { useEffect, useState } from 'react';
// import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import { COLORS } from '../constants';
// import { supabase } from '../lib/supabase';
// import AdminScreen from '../screens/AdminScreen';
// import AuthScreen from '../screens/AuthScreen';
// import HomeScreen from '../screens/HomeScreen';
// import MyBookingsScreen from '../screens/MyBookingsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import { Profile } from '../types';

// type TabKey = 'home' | 'mine' | 'admin' | 'profile';

// const USER_TABS: { key: TabKey; label: string }[] = [
//   { key: 'home', label: '🏠 Phòng' },
//   { key: 'mine', label: '📅 Đã đặt' },
//   { key: 'profile', label: '👤 Profile' },
// ];
// const ADMIN_TABS: { key: TabKey; label: string }[] = [
//   { key: 'home', label: '🏠 Phòng' },
//   { key: 'mine', label: '📅 Đã đặt' },
//   { key: 'admin', label: '🛠 Quản lý' },
//   { key: 'profile', label: '👤 Profile' },
// ];

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [ready, setReady] = useState<boolean>(false);
//   const [tab, setTab] = useState<TabKey>('home');

//   // Khôi phục phiên; nếu tài khoản đã bị xóa trên server thì tự đăng xuất
//   useEffect(() => {
//     supabase.auth.getSession().then(async ({ data }) => {
//       let s = data.session;
//       if (s) {
//         const { error } = await supabase.auth.getUser();
//         if (error && (error.status === 401 || error.status === 403)) {
//           await supabase.auth.signOut({ scope: 'local' });
//           s = null;
//         }
//       }
//       setSession(s);
//       setReady(true);
//     });
//     const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
//     return () => sub.subscription.unsubscribe();
//   }, []);

//   // Lấy profile (để biết vai trò) mỗi khi đăng nhập
//   const uid = session?.user.id;
//   useEffect(() => {
//     if (!uid) {
//       setProfile(null);
//       setTab('home');
//       return;
//     }
//     supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', uid)
//       .single()
//       .then(({ data }) => setProfile((data as Profile | null) ?? null));
//   }, [uid]);

//   if (!ready) {
//     return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
//   }

//   const isAdmin = profile?.role === 'admin';
//   const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
//         {!session ? (
//           <AuthScreen />
//         ) : (
//           <View style={{ flex: 1 }}>
//             <View style={{ flex: 1 }}>
//               {tab === 'home' && <HomeScreen userId={session.user.id} />}
//               {tab === 'mine' && <MyBookingsScreen userId={session.user.id} />}
//               {tab === 'admin' && isAdmin && <AdminScreen />}
//               {tab === 'profile' && (<ProfileScreen user={session.user} profile={profile} onProfileChange={setProfile} />)}            
//         </View>
//             <View style={styles.tabBar}>
//               {tabs.map((t) => (
//                 <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
//                   <Text style={[styles.tabText, tab === t.key && styles.tabActive]}>{t.label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         )}
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e5e7eb' },
//   tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
//   tabText: { color: COLORS.sub, fontWeight: '600', fontSize: 13 },
//   tabActive: { color: COLORS.primary },
// });
import type { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View, } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import AdminScreen from '../screens/AdminScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuthStore } from '../stores/useAuthStore';
import { Profile } from '../types';

type TabKey = 'home' | 'mine' | 'admin' | 'profile';

const USER_TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Phòng', icon: '⌂' },
  { key: 'mine', label: 'Đã đặt', icon: '▣' },
  { key: 'profile', label: 'Profile', icon: '●' },
];

const ADMIN_TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Phòng', icon: '⌂' },
  { key: 'mine', label: 'Đã đặt', icon: '▣' },
  { key: 'admin', label: 'Quản lý', icon: '⚙' },
  { key: 'profile', label: 'Profile', icon: '●' },
];

function TabButton({
  item,
  active,
  onPress,
}: {
  item: { key: TabKey; label: string; icon: string };
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.tabPress}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View
        style={[
          styles.tab,
          active && styles.tabActive,
          animatedStyle,
        ]}
      >
        <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
          {item.icon}
        </Text>

        <Text style={[styles.tabText, active && styles.tabTextActive]}>
          {item.label}
        </Text>

        {active && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  // const [session, setSession] = useState<Session | null>(null);
  // const [profile, setProfile] = useState<Profile | null>(null);
  // const [ready, setReady] = useState<boolean>(false);
  // const [tab, setTab] = useState<TabKey>('home');

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [tab, setTab] = useState<TabKey>('home');

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      let s = data.session;

      if (s) {
        const { error } = await supabase.auth.getUser();

        if (error && (error.status === 401 || error.status === 403)) {
          await supabase.auth.signOut({ scope: 'local' });
          s = null;
        }
      }

      setSession(s);
      setUser(s?.user ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
     (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setTab('home');
      return;
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
      .then(({ data }) => {
        setProfile((data as Profile | null) ?? null);
      });
  }, [uid]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <Animated.View entering={FadeIn.duration(500)}>
            <View style={styles.loadingLogo}>
              <Text style={styles.loadingLogoText}>VKU</Text>
            </View>

            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 20 }}
            />

            <Text style={styles.loadingText}>
              Đang khởi động...
            </Text>
          </Animated.View>
        </View>
      </SafeAreaProvider>
    );
  }

  const isAdmin = profile?.role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  return (
    <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={COLORS.bg}
          />

          <SafeAreaView
            style={styles.container}
            edges={['top', 'left', 'right']}
          >
            {!session ? (
              <AuthScreen />
            ) : (
              <View style={styles.main}>
                <Animated.View
                  key={tab}
                  entering={FadeInUp.duration(260)}
                  style={styles.content}
                >
                  {tab === 'home' && (
                    <HomeScreen userId={session.user.id} />
                  )}

                  {tab === 'mine' && (
                    <MyBookingsScreen userId={session.user.id} />
                  )}

                  {tab === 'admin' && isAdmin && (
                    <AdminScreen />
                  )}

                  {tab === 'profile' && (
                    <ProfileScreen
                      user={session.user}
                      profile={profile}
                      onProfileChange={setProfile}
                    />
                  )}
                </Animated.View>

                <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
                  <Animated.View
                    entering={FadeInDown.duration(300)}
                    style={styles.tabBar}
                  >
                    {tabs.map((item) => (
                      <TabButton
                        key={item.key}
                        item={item}
                        active={tab === item.key}
                        onPress={() => setTab(item.key)}
                      />
                    ))}
                  </Animated.View>
                </SafeAreaView>
              </View>
            )}
          </SafeAreaView>
        </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: COLORS.bg },
main: { flex: 1 },
content: { flex: 1 },
bottomSafe: { backgroundColor: COLORS.bg },
tabBar: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 7, padding: 6, borderRadius: 24, backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
tabPress: { flex: 1 },
tab: { minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
tabActive: { backgroundColor: COLORS.primarySoft },
tabIcon: { fontSize: 21, color: '#9ca3af', marginBottom: 3 },
tabIconActive: { color: COLORS.primary },
tabText: { color: '#9ca3af', fontSize: 11, fontWeight: '700' },
tabTextActive: { color: COLORS.primary, fontWeight: '800' },
activeDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
loadingScreen: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
loadingLogo: { width: 82, height: 82, borderRadius: 27, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
loadingLogoText: { color: '#fff', fontSize: 25, fontWeight: '900' },
loadingText: { marginTop: 12, textAlign: 'center', color: COLORS.sub, fontSize: 13, fontWeight: '600' },
});