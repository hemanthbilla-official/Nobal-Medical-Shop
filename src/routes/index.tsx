import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RoleBasedRoute } from "../components/RoleBasedRoute";
import { AppLayout } from "../components/AppLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { WorkerDashboard } from "../features/sales/WorkerDashboard";
import { OwnerDashboard } from "../features/sales/OwnerDashboard";
import { AllSalesEntries } from "../features/sales/AllSalesEntries";
import { AnalyticsDashboard } from "../features/analytics/AnalyticsDashboard";
import { BookPhotoUploader } from "../features/photos/BookPhotoUploader";
import { BookPhotoHistory } from "../features/photos/BookPhotoHistory";
import { AuditLogTable } from "../features/audit/AuditLogTable";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/worker" replace />} />
        <Route
          path="worker"
          element={
            <RoleBasedRoute allowedRole="worker">
              <WorkerDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="worker/photos"
          element={
            <RoleBasedRoute allowedRole="worker">
              <BookPhotoUploader />
            </RoleBasedRoute>
          }
        />
        <Route
          path="owner"
          element={
            <RoleBasedRoute allowedRole="owner">
              <OwnerDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="owner/entries"
          element={
            <RoleBasedRoute allowedRole="owner">
              <AllSalesEntries />
            </RoleBasedRoute>
          }
        />
        <Route
          path="owner/analytics"
          element={
            <RoleBasedRoute allowedRole="owner">
              <AnalyticsDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="owner/photos"
          element={
            <RoleBasedRoute allowedRole="owner">
              <BookPhotoHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="owner/audit"
          element={
            <RoleBasedRoute allowedRole="owner">
              <AuditLogTable />
            </RoleBasedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
