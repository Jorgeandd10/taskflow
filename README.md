# TaskFlow

A professional task management mobile application built with **Ionic 8**, **Angular 17**, and **Capacitor 6**.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Firebase Setup](#firebase-setup)
7. [Running Locally](#running-locally)
8. [Feature Flag — show_statistics_panel](#feature-flag)
9. [Android Build](#android-build)
10. [iOS Build](#ios-build)
11. [Performance Optimizations](#performance-optimizations)
12. [Technical Decisions](#technical-decisions)
13. [Known Limitations](#known-limitations)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Ionic Framework | 8.x | UI components & mobile UX |
| Angular | 17.x | Application framework |
| TypeScript | 5.x | Type safety |
| Capacitor | 6.x | Native Android/iOS runtime |
| @ionic/storage-angular | 4.x | Local persistence (IndexedDB/SQLite) |
| Firebase JS SDK | 10.x (modular) | Remote Config |
| @angular/fire | 17.x | Angular Firebase integration |

---

## Architecture

```
src/app/
├── core/
│   ├── constants/
│   │   └── storage-keys.constants.ts   # Centralized storage key names
│   ├── guards/
│   │   └── app-ready.guard.ts          # Ensures storage is ready before routing
│   ├── models/
│   │   ├── task.model.ts               # Task interface + DTOs
│   │   └── category.model.ts           # Category interface + DTOs + default colors
│   ├── repositories/
│   │   ├── task.repository.ts          # Storage abstraction for tasks
│   │   └── category.repository.ts     # Storage abstraction for categories
│   └── services/
│       ├── app-init.service.ts         # Boot orchestration (idempotent)
│       ├── task.service.ts             # Task business logic + signals state
│       ├── category.service.ts         # Category business logic + signals state
│       └── remote-config.service.ts   # Firebase Remote Config + feature flags
├── features/
│   ├── tasks/
│   │   ├── pages/task-list/            # Main task list page
│   │   └── components/
│   │       ├── task-item/              # Individual task row (OnPush)
│   │       └── task-form-modal/        # Create/Edit task modal
│   └── categories/
│       ├── pages/category-list/        # Category management page
│       └── components/
│           └── category-form-modal/    # Create/Edit category modal with color picker
└── shared/
    └── pipes/
        └── filter-by-category.pipe.ts  # Pure pipe (kept for reuse)
```

**Layer responsibilities:**

- **UI Layer** — Components and pages. Only presentation logic. No direct storage access.
- **Service Layer** — Business logic. Manages in-memory state via Angular Signals.
- **Repository Layer** — Storage abstraction. Services never call `@ionic/storage` directly.
- **Storage Layer** — `@ionic/storage-angular` (IndexedDB on web, SQLite on native).

---

## Features

### Task Management
- ✅ Create tasks with title and optional category
- ✅ Mark tasks as complete / incomplete (toggle)
- ✅ Delete tasks with confirmation dialog
- ✅ Edit task title and category
- ✅ Swipe left to toggle complete, swipe right to delete
- ✅ Local persistence — survives app restarts

### Category Management
- ✅ Create categories with custom name and color (10 presets)
- ✅ Edit category name and color
- ✅ Delete categories with task count warning
- ✅ Assign categories to tasks
- ✅ Filter task list by category via chip bar

### Category Deletion Policy
When a category is deleted, all tasks assigned to it are **unlinked** (their `categoryId` is set to `null`). Tasks are **never deleted automatically**. A confirmation dialog informs the user how many tasks will be unlinked before they confirm.

### Firebase Remote Config
- ✅ Feature flag `show_statistics_panel` controls a statistics panel on the home screen
- ✅ Statistics panel shows: total, completed, pending counts + progress bar
- ✅ Refresh button (top right) and pull-to-refresh for live Remote Config updates
- ✅ Graceful fallback to defaults when offline or Firebase is misconfigured

---

## Prerequisites

- **Node.js** 20.x LTS — [nodejs.org](https://nodejs.org)
- **npm** 10.x (bundled with Node.js)
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio** (for Android builds) — [developer.android.com/studio](https://developer.android.com/studio)
- **Xcode on macOS** (for iOS builds only)
- **JDK 17+** (for Android builds)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# 2. Switch to the development branch
git checkout feature/taskflow-challenge

# 3. Install dependencies
npm install
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `taskflow` → continue
3. Disable Google Analytics (optional) → **Create project**

### 2. Add a Web App

1. In the project overview, click the **Web** icon (`</>`)
2. Register app with nickname `TaskFlow Web`
3. Copy the `firebaseConfig` object

### 3. Configure environment file

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-actual-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.firebasestorage.app',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
  },
};
```

Do the same for `src/environments/environment.prod.ts`.

### 4. Enable Remote Config

1. In Firebase Console → **Remote Config** → **Create configuration**
2. Click **Add parameter**:
   - **Parameter key**: `show_statistics_panel`
   - **Data type**: Boolean
   - **Default value**: `false`
3. Click **Save** → **Publish changes**

---

## Running Locally

```bash
npm start
# Open http://localhost:4200
```

---

## Feature Flag

### `show_statistics_panel`

| Property | Value |
|---|---|
| Firebase key | `show_statistics_panel` |
| Type | Boolean |
| Default | `false` |
| Effect | Shows/hides the statistics panel on the task list screen |

**What the panel shows when enabled:**
- Total task count
- Completed task count
- Pending task count
- Progress bar with completion percentage

**How to demonstrate during evaluation:**

```
1. Open Firebase Console → Remote Config
2. Set show_statistics_panel = true → Publish changes
3. In the app → tap refresh icon (top right) OR pull to refresh
4. Statistics panel appears above the task list
5. Set back to false → Publish → refresh → panel disappears
```

The flag has a default of `false` and uses Firebase's `minimumFetchIntervalMillis`:
- **Development**: `0` ms (always fetches fresh values — ideal for demos)
- **Production**: `3,600,000` ms = 1 hour (Firebase minimum)

---

## Android Build

### Requirements
- Android Studio with SDK Platform 33+
- JDK 17 or higher
- `JAVA_HOME` and `ANDROID_HOME` environment variables set

### Steps

```bash
# 1. Build web assets
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets to Android project
npx cap sync android

# 4. Open Android Studio
npx cap open android
```

### In Android Studio:
1. Wait for Gradle sync to complete
2. **Build → Generate Signed Bundle/APK**
3. Select **APK** → Next
4. Create or select a keystore → fill in credentials
5. Select **release** build variant → **Finish**
6. APK is generated at `android/app/release/app-release.apk`

### Quick build (debug APK, no signing required):
```bash
# After cap sync android:
cd android && ./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## iOS Build

> **Note:** iOS builds require macOS with Xcode installed. If macOS is not available, see the alternative below.

### Requirements
- macOS with Xcode 15+
- Apple Developer Account (free for device testing, paid for App Store)
- CocoaPods: `sudo gem install cocoapods`

### Steps

```bash
# 1. Build web assets
npm run build

# 2. Add iOS platform (first time only)
npx cap add ios

# 3. Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# 4. Sync web assets
npx cap sync ios

# 5. Open Xcode
npx cap open ios
```

### In Xcode:
1. Select your development team in **Signing & Capabilities**
2. **Product → Archive**
3. In the Organizer: **Distribute App → Ad Hoc / Development**
4. Export the `.ipa` file

### Alternative if macOS is unavailable

The iOS platform configuration is fully set up in this repository. To generate the IPA without a local Mac:

**Option A — CI/CD service (recommended):**
- [Codemagic](https://codemagic.io) — free tier available, supports Capacitor
- [Bitrise](https://www.bitrise.io/) — free tier available

**Option B — Remote Mac service:**
- [MacStadium](https://www.macstadium.com/) or [MacinCloud](https://www.macincloud.com/)

In both cases, clone the repository, follow the iOS build steps above on the Mac environment, and export the IPA.

---

## Cordova Compatibility Note

This project uses **Capacitor 6** as the native runtime. The challenge specification mentions Cordova; Capacitor was chosen because:

- It is the **official successor to Cordova** for Ionic applications (recommended since Ionic 5)
- Better TypeScript support and modern plugin API
- Simpler configuration — no `config.xml` complexity
- All major Ionic plugins have Capacitor equivalents

To add Cordova support alongside Capacitor (if required):
```bash
ionic integrations enable cordova
```

---

## Performance Optimizations

| Optimization | Problem Solved | Implementation |
|---|---|---|
| **OnPush change detection** | Default CD checks every component on every event | All components use `ChangeDetectionStrategy.OnPush` |
| **Angular Signals** | RxJS subscriptions risk memory leaks and trigger unnecessary CD cycles | All state is managed via `signal()` and `computed()` — no subscriptions |
| **computed() for filtered lists** | Re-filtering tasks on every CD cycle | `filteredTasks` is a `computed()` — memoized, recalculates only when source signals change |
| **In-memory state cache** | Storage reads on every data access | Services read storage once on `initialize()`, then serve from signal |
| **Lazy-loaded routes** | All code in initial bundle bloats startup | Routes use `loadComponent()` — feature code loads on first navigation |
| **PreloadAllModules** | Lazy routes have latency on first navigation | Idle time is used to preload lazy chunks after initial render |
| **eventCoalescing** | Multiple DOM events trigger multiple CD cycles | `provideZoneChangeDetection({ eventCoalescing: true })` batches events |
| **Non-blocking Remote Config** | Firebase fetch delays initial render | RC is initialized after UI renders; defaults applied immediately |
| **appReadyGuard** | Components render before storage.create() completes | Guard resolves only after full initialization, preventing empty-state flash |
| **Parallel data loading** | Sequential storage reads delay boot | `Promise.all([taskService.initialize(), categoryService.initialize()])` |

---

## Technical Decisions

### Why Capacitor over Cordova?
See [Cordova Compatibility Note](#cordova-compatibility-note).

### Why Angular Signals over RxJS Observables?
For local UI state (task list, category list), Signals provide:
- Simpler syntax — no `async` pipe or manual subscriptions
- Automatic dependency tracking in `computed()`
- No risk of forgotten `unsubscribe()` causing memory leaks
- Fine-grained reactivity — only components that read a signal re-render

RxJS is still appropriate for HTTP streams, WebSocket events, and complex async orchestration — none of which are needed in this app.

### Why @ionic/storage-angular for persistence?
It automatically uses the best available storage engine:
- **Web**: IndexedDB (large capacity, structured)
- **Android/iOS with SQLite plugin**: SQLite (native performance)

The repository pattern means switching to a different storage engine in the future requires changing only the repository classes — services and components are unaffected.

### Category deletion: why Option A (unlink)?
Alternatives considered:
- **Option B (block deletion)**: Frustrating UX — forces users to manually reassign before deleting
- **Option C (cascade delete)**: Dangerous — user loses tasks without necessarily intending to

Option A (unlink) is the most user-friendly and recoverable. The confirmation dialog is explicit about how many tasks will be unlinked.

---

## Known Limitations

- **IPA not provided**: iOS build requires macOS + Xcode. Complete build instructions and CI/CD alternatives are documented above.
- **Storage size**: `@ionic/storage-angular` is suitable for hundreds of tasks. For thousands, consider SQLite with individual row queries instead of storing the full array.
- **No offline sync**: Data is local-only. Firebase is used only for Remote Config, not data sync.
- **Remote Config cache**: In production, changes take up to 1 hour to be fetched automatically. Manual refresh (tap button or pull-to-refresh) bypasses the cache during demos.
