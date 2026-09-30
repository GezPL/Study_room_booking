# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Real-time Study Room Booking App (Mini-Project 2)
**Team / Student Name:** Phạm Ngọc Long
**Submission Date:** 01/10/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Phạm Ngọc Long — Student ID: 23IT.B122 — Role: Fullstack Mobile Developer / Architecture & UI/UX — Contribution: 100%
* **🔗 Live Demo URL:** [https://expo.dev/artifacts/eas/MkBHe5Mz8QFNvhjWIFt82NGm0VXO-zmUbpfzA5fGJAQ.apk](https://expo.dev/artifacts/eas/MkBHe5Mz8QFNvhjWIFt82NGm0VXO-zmUbpfzA5fGJAQ.apk) *(Direct APK Download)* | [Expo Cloud Build Page](https://expo.dev/accounts/longp/projects/vku-study-room-booking/builds/84381245-527d-41c1-8160-ef644470b2ef)
* **💻 GitHub Repository:** [https://github.com/GezPL/Study_room_booking.git](https://github.com/GezPL/Study_room_booking.git)
* **🎥 Video Demo (Optional):** [https://youtu.be/xxx]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | Global State Management & Offline Persistence | ✅ Complete | Implemented `useBookingStore` with Zustand & `@react-native-async-storage/async-storage` via `persist` middleware, auto-rehydration, and student session migration (`Phạm Ngọc Long - 23IT.B122`). |
| 2 | Room Discovery & Multi-Parameter Filter | ✅ Complete | 60fps scrolling performance using `React.memo` on `RoomCard`. Multi-parameter chip filters (Buildings: A, B, C, V; Capacity: 2-4, 5-10, 11-20; Equipment: Projector, Whiteboard, High-spec PC, AC) and instant search. |
| 3 | Interactive Time-Slot Selector & Conflict Engine | ✅ Complete | 7-day horizontal dynamic date picker, 4 fixed 2-hour slots grid (`07:30-09:30`, `09:30-11:30`, `13:00-15:00`, `15:00-17:00`). Real-time collision engine disabling booked slots with strikethrough & "Booked" badge. |
| 4 | Past Slot Validation & Dynamic Room Status | ✅ Complete | Client-side time validation blocking past slots on the current day (`Expired` status). Dynamic calculation of room availability (`Available Now` vs `Occupied`) reflecting live bookings in the active hour. |
| 5 | Interactive Digital QR Code & Booking Pass Modal | ✅ Complete | Algorithmic geometric matrix QR code (`InteractiveQRCode`) with simulated check-in tap feedback. Generates persistent digital pass (`#PASS-XXXXX`) viewable upon booking or anytime from My Bookings. |
| 6 | Reservation Management & Rescheduling | ✅ Complete | Segmented My Bookings into `Upcoming` and `History` tabs. Interactive `RescheduleModal` allows changing dates and time-slots without double-booking conflict with self (`excludeBookingId`), plus Fair Usage Quota (max 3 bookings). |
| 7 | Local Push Notifications | ✅ Complete | Automated local notification scheduling via `expo-notifications` exactly 15 minutes before the time-slot begins. Automatically cancels and reschedules reminders when reservations are cancelled or changed. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE
* **Modular Project Structure:**
  ```
  mini_project2/
  ├── scripts/
  │   └── patch-expo-notifications.js   # Automated postinstall patch for Expo Go Android
  ├── src/
  │   ├── components/                   # Reusable UI (RoomCard, FilterSection, InteractiveQRCode, BookingPassModal, RescheduleModal)
  │   ├── navigation/                   # Navigation architecture (RootNavigator Native Stack, TabNavigator with badges)
  │   ├── screens/                      # Main screens (HomeScreen, RoomDetailScreen, MyBookingsScreen)
  │   ├── store/                        # Centralized Zustand store with AsyncStorage persistence & schema migration
  │   ├── types/                        # TypeScript type definitions (Room, Booking, ActiveFilters, NavigationParams)
  │   └── utils/                        # Utilities (dateHelpers, mockData, notifications scheduler)
  ├── QR_DOWNLOAD.html                  # Standalone landing page for presenting APK QR download
  ├── eas.json                          # Expo Application Services build configuration
  └── app.json                          # Expo manifest & native app configuration
  ```
* **State Management Flows:**
  - Unidirectional state management powered by Zustand. Components subscribe to granular state slices using reactive selectors to minimize unnecessary re-renders.
  - State persistence handles automatic rehydration from `@react-native-async-storage/async-storage` with versioning migration logic ensuring student identity integrity.
* **Exception Handling & Validation Strategies:**
  - Real-time Conflict Engine intercepts booking and rescheduling collisions prior to state mutations.
  - Client-side time validation checks prevent scheduling expired slots in the past.
  - Quota verification enforces VKU study room policy (maximum 3 active upcoming reservations per student).
  - Custom `postinstall` script patches `expo-notifications` to prevent runtime crashes caused by deprecated push modules in Expo Go Android.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS
* **Figure 1 (Home Discovery & Multi-Parameter Filter):**
  ![Home Screen Filter & Room List](assets/screenshots/01_home_filter.png)
  *Annotated: 60fps memoized room cards, real-time search, multi-parameter chip filters, and live availability indicators.*

* **Figure 2 (Room Detail, Time Selector & Conflict Engine):**
  ![Room Detail & Conflict Engine](assets/screenshots/02_booking_conflict.png)
  *Annotated: 7-day horizontal date selector and 4 fixed 2-hour slots grid with expired slot locking and disabled booked slots.*

* **Figure 3 (Interactive QR Booking Pass Modal):**
  ![Interactive QR Booking Pass](assets/screenshots/03_qr_pass.png)
  *Annotated: Digital pass displaying student identity (Phạm Ngọc Long - 23IT.B122), booking details, and interactive simulated check-in QR code.*

* **Figure 4 (My Bookings Management & Rescheduling):**
  ![My Bookings & Rescheduling](assets/screenshots/04_my_bookings.png)
  *Annotated: Segmented Upcoming/History tabs, View Pass QR modal, Reschedule modal with conflict exclusion, and cancellation.*

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS
* **Challenge 1: Expo Go Android SDK 53+ Push Notification Native Module Incompatibility**
  - *Context:* In Expo SDK 53+, remote push native modules (`ExpoTopicSubscriptionModule`, `ExpoPushTokenManager`, `NotificationsServerRegistrationModule`) were removed from the Expo Go Android client, causing `expo-notifications` to crash immediately upon bundle evaluation with a fatal runtime error.
  - *Resolution:* Created an automated `postinstall` script (`scripts/patch-expo-notifications.js`) hooked into `package.json`. The script inspects `expo-notifications` source files and replaces hard `requireNativeModule` calls with safe `requireOptionalNativeModule` fallbacks and bypasses `warnOfExpoGoPushUsage.js`. This allows local notification scheduling (15 minutes before booking) to function flawlessly in Expo Go without any crashes.

* **Challenge 2: Slot Collision & Self-Conflict Resolution During Rescheduling**
  - *Context:* When allowing students to modify their existing reservation time via `RescheduleModal`, the naive conflict detection function `isSlotBooked(roomId, date, timeSlot)` falsely marked the user's existing reservation as a conflict if they selected a different slot on the same day or room.
  - *Resolution:* Enhanced the conflict engine signature to accept an optional `excludeBookingId` parameter (`isSlotBooked(roomId, date, timeSlot, excludeBookingId)`). The engine ignores the current reservation ID during check, correctly permitting users to switch slots while preventing overlapping bookings from other students.
