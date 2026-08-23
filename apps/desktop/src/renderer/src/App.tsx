import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { InventoryPage } from "./pages/InventoryPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { SupplierReturnsPage } from "./pages/SupplierReturnsPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { MembershipPage } from "./pages/MembershipPage";
import { PosPage } from "./pages/PosPage";
import { SalesPage } from "./pages/SalesPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { CashManagementPage } from "./pages/CashManagementPage";
import { BkashManagementPage } from "./pages/BkashManagementPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsBackupPage } from "./pages/SettingsBackupPage";
import { ReportsPage } from "./pages/ReportsPage";
import { useAuthStore } from "./store/authStore";
import { ToastContainer } from "./components/ToastContainer";
import { call } from "./api/client";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { session, setSession } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    call("auth:me")
      .then((s) => setSession(s as any))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="supplier-returns" element={<SupplierReturnsPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />

          {/* Cash Management */}
          <Route
            path="cash-management"
            element={<CashManagementPage />}
          />

          {/* bKash Management */}
          <Route
            path="bkash-management"
            element={<BkashManagementPage />}
          />

          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsBackupPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </>
  );
}
