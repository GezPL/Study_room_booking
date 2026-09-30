# 🏫 VKU Study Room Booking App
### Ứng dụng Đặt phòng học thông minh theo thời gian thực dành cho sinh viên VKU

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand_5-443e38?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📖 Giới thiệu Dự án

**VKU Study Room Booking** là ứng dụng di động đa nền tảng (iOS / Android) được thiết kế riêng cho sinh viên Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU) - Đại học Đà Nẵng. Ứng dụng giải quyết bài toán tìm kiếm không gian tự học, làm việc nhóm, nghiên cứu lab và bảo vệ đồ án thông qua hệ thống đặt phòng theo thời gian thực với cơ chế chống trùng lịch (Conflict Engine) và vé vào phòng điện tử QR Code.

---

## 🚀 Tính năng nổi bật

### 1. 🔍 Khám phá phòng học & Bộ lọc đa tham số tức thì (Home Screen)
- **Hiệu năng cuộn 60fps**: Tối ưu hóa `FlatList` kết hợp với `React.memo` cho component `RoomCard` giúp giao diện luôn mượt mà khi hiển thị danh sách phòng chất lượng cao.
- **Bộ lọc Chip đa thông số**:
  - **Khu vực tòa nhà**: Khu A, Khu B, Khu C, Khu V (Tòa nhà Hữu nghị Việt - Hàn).
  - **Sức chứa linh hoạt**: 2–4 người, 5–10 người, 11–20 người.
  - **Thiết bị phòng học**: Máy chiếu (Projector), Bảng trắng (Whiteboard), Máy tính cấu hình cao (High-spec PC), Điều hòa (AC).
- **Tìm kiếm thời gian thực**: Tìm nhanh theo tên phòng hoặc mã tòa nhà.

### 2. 📅 Bộ chọn lịch 7 ngày & Lưới khung giờ 2 tiếng (Booking Flow)
- **Bộ chọn ngày 7 ngày tới**: Tự động tính toán ngày linh động (Hôm nay, Ngày mai, Thứ...) với giao diện cuộn ngang trực quan.
- **4 khung giờ cố định tiêu chuẩn**:
  - `07:30 - 09:30` (Ca 1 sáng)
  - `09:30 - 11:30` (Ca 2 sáng)
  - `13:00 - 15:00` (Ca 1 chiều)
  - `15:00 - 17:00` (Ca 2 chiều)

### 3. 🛡️ Cơ chế chống trùng lịch thông minh (Real-time Conflict Engine)
- Tự động đối soát trạng thái với `useBookingStore`. Nếu một khung giờ của phòng trong ngày đã có người đặt, hệ thống sẽ **lập tức vô hiệu hóa (disabled)** nút bấm đó, đổi màu xám, gạch ngang thời gian và hiển thị nhãn **"Booked"**, ngăn ngừa tình trạng đặt đè slot.

### 4. 🎫 Vé vào phòng điện tử & Mã QR tương tác (Booking Pass Modal)
- Sau khi xác nhận đặt phòng thành công, ứng dụng sinh ra thẻ vào phòng **Booking Pass** chứa:
  - Mã QR Code tương tác độc bản tạo bằng thuật toán ma trận hình học (`InteractiveQRCode`), cho phép chạm để mô phỏng quét check-in khi vào phòng.
  - Mã đặt phòng dạng mã số định danh (`#PASS-XXXXX`).
  - Thông tin sinh viên, tên phòng, tầng và khung giờ đã chọn.

### 5. ⏰ Thông báo cục bộ nhắc hẹn tự động (Local Notifications)
- Tích hợp `expo-notifications` lên lịch thông báo cục bộ chính xác **15 phút trước giờ bắt đầu**.
- Tự động hủy thông báo khi sinh viên chủ động hủy đặt phòng.
- Đã được vá tương thích tối đa với Expo Go trên hệ điều hành Android (Expo SDK 53+).

### 6. 💾 Lưu trữ dữ liệu bền vững (Offline Persistence)
- Tích hợp Zustand với `@react-native-async-storage/async-storage` qua `persist` middleware.
- Toàn bộ lịch đặt phòng và phiên đăng nhập của sinh viên được lưu trữ trên thiết bị, không bị mất đi khi tắt app hoặc khởi động lại thiết bị.

---

## 🏗️ Kiến trúc Mô-đun (Modular Architecture)

Dự án được xây dựng theo mô hình phân tách mối quan tâm (Separation of Concerns), phân lớp rõ ràng giữa giao diện, logic trạng thái và tiện ích hệ thống:

```
mini_project2/
├── assets/                       # Ảnh biểu tượng, adaptive icon, favicon
├── scripts/
│   └── patch-expo-notifications.js # Script tự động vá lỗi Expo Go Android cho SDK 57
├── src/
│   ├── components/               # Các UI components tái sử dụng
│   │   ├── RoomCard.tsx          # Card hiển thị phòng học (memoized tối ưu 60fps)
│   │   ├── FilterSection.tsx     # Cụm chip lọc theo Tòa, Sức chứa, Thiết bị
│   │   ├── InteractiveQRCode.tsx # Mã QR tương tác mô phỏng check-in
│   │   ├── BookingPassModal.tsx  # Modal vé vào phòng học sau khi đặt
│   │   └── index.ts              # Barrel export
│   │
│   ├── navigation/               # Điều hướng ứng dụng (React Navigation)
│   │   ├── RootNavigator.tsx     # Native Stack: [MainTabs, RoomDetail]
│   │   └── TabNavigator.tsx      # Bottom Tabs: [Home, MyBookings] kèm dynamic badge
│   │
│   ├── screens/                  # Các màn hình chính
│   │   ├── HomeScreen.tsx        # Danh sách phòng, tìm kiếm và bộ lọc
│   │   ├── RoomDetailScreen.tsx  # Chi tiết phòng, chọn ngày & lưới slot chống trùng
│   │   └── MyBookingsScreen.tsx  # Quản lý danh sách đặt chỗ cá nhân & hủy lịch
│   │
│   ├── store/                    # Quản lý trạng thái toàn cục (Zustand)
│   │   └── useBookingStore.ts    # Store trung tâm kết hợp AsyncStorage persistence
│   │
│   ├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
│   │   └── index.ts              # Type definitions (Room, Booking, Filters, Nav Params)
│   │
│   └── utils/                    # Tiện ích bổ trợ & dữ liệu tĩnh
│       ├── dateHelpers.ts        # Tạo danh sách 7 ngày liên tiếp từ ngày hiện tại
│       ├── mockData.ts           # Mock data 10 phòng học các khu A, B, C, V VKU
│       └── notifications.ts      # Hàm lên lịch & hủy thông báo nhắc trước 15 phút
│
├── App.tsx                       # Điểm khởi tạo ứng dụng, Safe Area & Navigation Container
├── app.json                      # Cấu hình Expo, config plugins và metadata
├── index.ts                      # Đăng ký root component với Expo runtime
├── package.json                  # Dependencies và scripts
└── tsconfig.json                 # Cấu hình TypeScript nghiêm ngặt (Strict mode)
```

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Công nghệ | Phiên bản | Mục đích |
| :--- | :--- | :--- |
| **React Native** | `0.86.3` | Nền tảng xây dựng ứng dụng di động native |
| **Expo** | `~57.0.25` | Bộ công cụ phát triển ứng dụng di động hiện đại |
| **TypeScript** | `~6.0.3` | Kiểm soát kiểu tĩnh, phát hiện lỗi lúc biên dịch |
| **React Navigation** | `^7.x` | Bottom Tabs Navigation & Native Stack Navigation |
| **Zustand** | `^5.0.15` | Quản lý state toàn cục gọn nhẹ, tối ưu re-render |
| **AsyncStorage** | `2.2.0` | Lưu trữ dữ liệu lịch đặt phòng bền vững trên thiết bị |
| **Expo Notifications**| `~57.0.21` | Lên lịch thông báo cục bộ nhắc giờ vào phòng |
| **Expo Vector Icons** | `^15.0.2` | Bộ biểu tượng Ionicons trực quan cho giao diện |

---

## ⚙️ Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (Khuyến nghị phiên bản LTS v20+ hoặc v24+).
- Đã cài đặt ứng dụng **Expo Go** trên điện thoại (tải từ Google Play Store hoặc Apple App Store).

### 2. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục gốc của dự án và chạy:

```bash
# Cài đặt toàn bộ thư viện cần thiết
npm install
```
> **Ghi chú**: Lệnh `npm install` sẽ tự động thực hiện hook `postinstall: node scripts/patch-expo-notifications.js` để vá tính tương thích của `expo-notifications` trên Expo Go Android.

### 3. Khởi chạy máy chủ phát triển (Metro Bundler)

```bash
# Khởi động Expo Dev Server (với cờ -c để làm sạch cache bundle)
npx expo start -c
```

### 4. Mở ứng dụng trên thiết bị
- **Thiết bị Android thật**: Mở ứng dụng **Expo Go**, chọn *Scan QR Code* và quét mã QR hiển thị trên màn hình terminal.
- **Thiết bị iOS thật**: Mở ứng dụng **Camera** mặc định, quét mã QR và chọn mở bằng **Expo Go**.
- **Trình giả lập Android / iOS Simulator**: Nhấn phím `a` (cho Android Emulator) hoặc phím `i` (cho iOS Simulator) trong terminal.
- **Giao diện Web**: Nhấn phím `w` để mở xem thử trên trình duyệt web.

---

## 🧪 Kiểm tra Chất lượng Mã nguồn (Lint & Typecheck)

Dự án tuân thủ nghiêm ngặt các quy chuẩn code sạch của React Native & Expo:

```bash
# 1. Kiểm tra an toàn kiểu dữ liệu TypeScript (Zero errors)
npx tsc --noEmit

# 2. Kiểm tra quy chuẩn mã nguồn ESLint (Zero warnings)
npm run lint

# 3. Chẩn đoán cấu hình & tính tương thích của Expo
npx expo-doctor
```

---

## 📱 Luồng trải nghiệm người dùng (User Journey)

1. **Khám phá**: Sinh viên mở ứng dụng, thấy danh sách phòng kèm ảnh chụp thật, trạng thái khả dụng tức thì (`Available Now` / `Occupied`), sức chứa và thiết bị.
2. **Lọc phòng**: Lựa chọn nhanh theo tòa nhà (A/B/C/V), theo sức chứa nhóm cần, hoặc trang bị cần thiết (như máy chiếu, PC đồ họa).
3. **Chọn lịch & Giờ**: Vào chi tiết phòng, lướt ngang chọn ngày trong tuần, nhấp chọn một trong 4 khung giờ 2 tiếng. Các giờ đã bị sinh viên khác đặt trước sẽ tự động bị khóa và gạch ngang.
4. **Nhận vé vào phòng**: Nhấn *"Confirm Booking"*, hệ thống lập tức lên lịch thông báo nhắc trước 15 phút và hiển thị thẻ vé **Booking Pass** kèm mã QR để check-in.
5. **Quản lý đặt chỗ**: Chuyển sang Tab *"My Bookings"* (có biểu tượng badge hiển thị số phòng đang giữ) để xem lại vé hoặc hủy lịch khi bận đột xuất.

---

## 👥 Nhóm Tác Giả & Bản Quyền

- **Đơn vị**: Khoa Công nghệ Thông tin & Kinh tế số - Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU).
- **Học phần**: Phát triển ứng dụng đa nền tảng (Cross-platform Application Development).
- **Giấy phép**: [MIT License](LICENSE).

