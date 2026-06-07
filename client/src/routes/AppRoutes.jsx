import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/AppShell.jsx";
import BooksPage from "../pages/BooksPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import LoansPage from "../pages/LoansPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ReservationsPage from "../pages/ReservationsPage.jsx";
import UsersPage from "../pages/UsersPage.jsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<AppShell />}>
        <Route element={<DashboardPage />} index />
        <Route element={<BooksPage />} path="books" />
        <Route element={<LoansPage />} path="loans" />
        <Route element={<ReservationsPage />} path="reservations" />
        <Route element={<UsersPage />} path="users" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
