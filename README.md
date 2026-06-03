# Medical Shop Sales Management

A production-ready responsive web application for managing daily sales entries for a single medical shop. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for build tooling
- **Firebase Authentication** for login
- **Firestore Database** for data storage
- **Firebase Storage** for book photo uploads
- **Tailwind CSS** for styling
- **React Router** for routing
- **Recharts** for analytics charts
- **xlsx** for Excel export
- **jsPDF** + **jspdf-autotable** for PDF export
- **react-hot-toast** for notifications

## Prerequisites

- Node.js 18+
- A Firebase project with Authentication, Firestore, and Storage enabled

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the example environment file and fill in your Firebase config values:

```bash
cp .env.example .env
```

Get your Firebase config from the Firebase Console (Project Settings > General > Your apps > Web app):

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Enable Firebase Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable the **Email/Password** provider
3. This step is required before the script can create users

### 4. Create accounts using the script

The project includes a script that creates the Firebase Auth user and the Firestore role document. Make sure `.env` is configured first.

**Option A: Full create (recommended)**

```bash
node scripts/create-user.mjs --email owner@shop.com --password yourpassword --name "Shop Owner" --role owner
node scripts/create-user.mjs --email worker1@shop.com --password yourpassword --name "Worker One" --role worker
```

**Option B: Role only** (if you already created the user manually in Firebase Console)

```bash
# 1. Create the user manually in Firebase Console > Authentication > Users
# 2. Note the user's UID
# 3. Run the script with --uid instead of --email/--password:
node scripts/create-user.mjs --uid USER_UID --name "Worker Name" --role worker
```

### 5. Add user role documents manually (alternative)

If the script doesn't work, create users manually:

1. Go to Firebase Console > Authentication > Users > Add user
2. Create accounts for the owner and each worker
3. Note each user's UID
4. Go to Firestore Database, create a collection named `users`
5. For each user, add a document with their UID as the document ID:

```json
{
  "uid": "USER_UID",
  "name": "Owner Name",
  "email": "owner@example.com",
  "role": "owner",
  "createdAt": Firestore.serverTimestamp()
}
```

### 5. Deploy Firestore Security Rules

Copy the rules from `firestore.rules` and deploy them:

```bash
firebase deploy --only firestore:rules
```

Or paste them directly in the Firebase Console > Firestore > Rules tab.

### 6. Enable Firebase Storage

1. Go to Firebase Console > Storage
2. Set up storage with the default rules (customize as needed)
3. For testing, you can use the default rules that allow authenticated access

### 7. Run the app locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 8. Deploy the app

Build for production:

```bash
npm run build
```

Deploy to Firebase Hosting:

```bash
firebase init hosting
firebase deploy --only hosting
```

Or deploy to any static hosting provider (Vercel, Netlify, etc.).

## Firestore Collections

### `users`

Stores user profiles and roles.

| Field | Type | Description |
|-------|------|-------------|
| uid | string | Firebase Auth UID |
| name | string | Display name |
| email | string | Email address |
| role | "owner" or "worker" | User role |
| createdAt | Timestamp | Account creation time |

### `salesEntries`

Stores all sales entries.

| Field | Type | Description |
|-------|------|-------------|
| serialNumber | string | Serial number matching physical book |
| itemName | string | Name of the item sold |
| paymentType | "cash" or "scan" | Payment method |
| amount | number | Sale amount |
| quantity | number | Quantity sold |
| date | string | Date in YYYY-MM-DD format |
| time | string | Time in HH:mm format |
| workerId | string | Firebase UID of the worker |
| workerName | string | Display name of the worker |
| createdBy | string | UID of who created the entry |
| createdAt | Timestamp | When the entry was created |
| updatedAt | Timestamp or null | When the entry was last updated |
| deletedAt | Timestamp or null | When the entry was soft-deleted |
| isDeleted | boolean | Soft delete flag |

### `bookPhotos`

Stores metadata for uploaded book photos.

| Field | Type | Description |
|-------|------|-------------|
| date | string | Date in YYYY-MM-DD format |
| uploadedBy | string | UID of the uploader |
| uploadedByName | string | Display name of the uploader |
| storagePath | string | Path in Firebase Storage |
| downloadURL | string | Public download URL |
| createdAt | Timestamp | Upload time |

### `auditLogs`

Tracks all create, update, and delete actions.

| Field | Type | Description |
|-------|------|-------------|
| action | "create" or "update" or "delete" | Type of action |
| entityType | "salesEntry" or "bookPhoto" | Type of entity |
| entityId | string | Document ID of the entity |
| performedBy | string | UID of the user |
| performedByName | string | Display name |
| performedByRole | "owner" or "worker" | Role of the user |
| before | object or null | Previous state (for updates/deletes) |
| after | object or null | New state (for creates/updates) |
| createdAt | Timestamp | When the action occurred |

## Security Rules

The `firestore.rules` file enforces role-based access:

- **Owner**: Full read/write access to all collections
- **Worker**: Can read/write their own sales entries, can read/write their own book photos
- **Worker restrictions**: Can only access sales entries and book photos they created
- **Audit logs**: Only owner can read; any authenticated user can create
- **Deletes**: Physical deletes are disabled; use soft deletes via updates

## Roles & Permissions

| Feature | Owner | Worker |
|---------|-------|--------|
| Add sales entries | Yes | Yes |
| View sales entries | All | Own entries only |
| Edit sales entries | Any date | Own entries, any date |
| Delete sales entries | Any date (soft delete) | Own entries, any date (soft delete) |
| Upload book photos | Yes | Yes |
| View book photos | All | Own uploads only |
| View analytics | Full dashboard | Limited (own sales totals) |
| Export Excel/PDF | Yes | No |
| View audit logs | Yes | No |

## Scripts

```bash
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint
node scripts/create-user.mjs  # Create owner/worker accounts (see setup step 3)
```

## Known Limitations

1. **Book photo comparison is manual** - Photos are stored for manual reference only
2. **OCR is not included** - No automatic text extraction from book photos
3. **Single shop only** - The app is designed for one medical shop and does not support multi-tenant or multi-shop setups

## Project Structure

```
src/
  App.tsx              # Root component with providers
  main.tsx             # Entry point
  index.css            # Tailwind imports
  components/          # Reusable UI components
    AppLayout.tsx
    ConfirmDialog.tsx
    DateRangeFilter.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    PaymentTypeBadge.tsx
    ProtectedRoute.tsx
    RoleBasedRoute.tsx
    SalesEntryForm.tsx
    SalesEntryTable.tsx
    SummaryCard.tsx
  features/
    analytics/         # Analytics dashboard with charts
    audit/             # Audit log viewing
    auth/              # Login, auth context, useAuth hook
    photos/            # Book photo upload and history
    sales/             # Worker and owner dashboards
  firebase/            # Firebase configuration and services
  hooks/               # Custom React hooks for data fetching
  routes/              # Route definitions
  types/               # TypeScript type definitions
  utils/               # Utility functions (date, format, export, audit)
```
