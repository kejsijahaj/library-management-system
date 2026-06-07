import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/AppShell.jsx";
import BooksPage from "../pages/BooksPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import LoansPage from "../pages/LoansPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import MyLibraryPage from "../pages/MyLibraryPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ReservationsPage from "../pages/ReservationsPage.jsx";
import UsersPage from "../pages/UsersPage.jsx";
import GuestRoute from "./GuestRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<DashboardPage />} index />
          <Route element={<BooksPage />} path="books" />
          <Route element={<MyLibraryPage />} path="my-library" />
          <Route element={<ReservationsPage />} path="reservations" />

          <Route element={<ProtectedRoute roles={["admin", "librarian"]} />}>
            <Route element={<LoansPage />} path="loans" />
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<UsersPage />} path="users" />
          </Route>
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
