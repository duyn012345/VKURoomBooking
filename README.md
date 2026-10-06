# VKU Room Booking

Ứng dụng mobile đặt phòng học/phòng máy dành cho sinh viên và giảng viên VKU.

## 📌 Giới thiệu

VKU Room Booking là ứng dụng đặt phòng học trên nền tảng mobile, giúp sinh viên và giảng viên tìm kiếm phòng, kiểm tra trạng thái phòng và đặt phòng theo ngày và ca học.

Hệ thống sử dụng Supabase để lưu trữ và đồng bộ dữ liệu, đồng thời hỗ trợ quản lý phòng và lịch đặt cho Admin.

## ✨ Chức năng

- Đăng ký, đăng nhập và đăng xuất
- Quản lý thông tin cá nhân
- Tìm kiếm phòng
- Lọc phòng theo nhiều tiêu chí
- Xem thông tin và trạng thái phòng
- Chọn ngày và ca học
- Đặt phòng
- Kiểm tra và xử lý xung đột lịch đặt
- Xem lịch sử đặt phòng
- Hủy lịch đặt
- Cập nhật dữ liệu theo thời gian thực
- Admin quản lý phòng
- Admin quản lý lịch đặt
- Quản lý trạng thái phòng: hoạt động / bảo trì
- Giao diện mobile với animation

## 🛠️ Công nghệ sử dụng

- React Native
- Expo SDK 57
- TypeScript
- Supabase
- Zustand
- TanStack Query
- React Native Reanimated
- Expo Router

## 📂 Cấu trúc thư mục

```text
src/
├── app/          # Màn hình và navigation
├── components/   # Các component giao diện
├── hooks/        # Custom hooks và TanStack Query
├── stores/       # Zustand state management
├── lib/          # Supabase và các tiện ích
├── screens/      # Các màn hình ứng dụng
├── constants/    # Các hằng số
└── types/        # TypeScript types

```
## 🚀 Cài đặt và chạy project
1. Cài đặt dependencies
npm install

2. Cấu hình biến môi trường
Tạo file .env ở thư mục gốc:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

3. Khởi chạy ứng dụng
npx expo start

Sau đó có thể chạy ứng dụng bằng Android Emulator, thiết bị Android hoặc Expo Go.
```

## 👥 Vai trò người dùng
Sinh viên
- Tìm kiếm và lọc phòng
- Xem thông tin phòng
- Đặt phòng
- Xem lịch sử đặt phòng
- Hủy lịch đặt
- Quản lý thông tin cá nhân
Giảng viên
- Tìm kiếm và lọc phòng
- Xem thông tin phòng
- Đặt phòng
- Xem lịch sử đặt phòng
- Hủy lịch đặt
- Quản lý thông tin cá nhân
Admin
- Quản lý phòng
- Quản lý trạng thái phòng
- Quản lý lịch đặt
- Hủy lịch đặt khi cần thiết
```
## 📅 Quy trình đặt phòng
1. Người dùng đăng nhập.
2. Tìm kiếm hoặc lọc phòng.
3. Chọn phòng muốn đặt.
4. Chọn ngày và ca học.
5. Hệ thống kiểm tra trạng thái phòng.
6. Xác nhận đặt phòng.
7. Lịch đặt được lưu vào Supabase.
8. Dữ liệu được cập nhật trên ứng dụng.
Hệ thống có cơ chế kiểm tra xung đột để hạn chế nhiều người đặt cùng một phòng trong cùng ngày và ca.
```

🔄 State Management
Project sử dụng Zustand để quản lý trạng thái người dùng và thông tin profile.
TanStack Query được sử dụng để quản lý dữ liệu từ Supabase, caching, loading/error state và cập nhật dữ liệu sau các thao tác.
Supabase Realtime được sử dụng để cập nhật dữ liệu phòng và booking theo thời gian thực.
```

## 🎯 Mục tiêu
Xây dựng một ứng dụng mobile đặt phòng học thuận tiện, dễ sử dụng và hạn chế tình trạng trùng lịch, đồng thời cung cấp chức năng quản lý cho Admin.

```

## 👨‍💻 Thông tin project

**Project:** VKU Room Booking

**Môn học:** Phát triển ứng dụng đa nền tảng

**Sinh viên thực hiện:** Lê Thị Mỹ Duyên

**Framework:** React Native + Expo

**Backend:** Supabase

**Ngôn ngữ:** TypeScript

