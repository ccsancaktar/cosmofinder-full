import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import authService from "../services/authService";
import adminService from "../services/adminService";
import AdminLayout from "../components/AdminLayout";
import OverviewPage from "./OverviewPage";
import SystemPage from "./SystemPage";
import UsersPage from "./UsersPage";
import ActivityPage from "./ActivityPage";

export default function Dashboard({ onLogout }) {
  const [overview, setOverview] = useState(null);
  const [system, setSystem] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [userActionError, setUserActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [systemLoading, setSystemLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getOverview();
      setOverview(response.data);
    } catch (err) {
      console.error("Admin overview error:", err);
      setError(err.response?.data?.error || "Admin panel verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const loadSystem = async () => {
    setSystemLoading(true);
    try {
      const response = await adminService.getSystem();
      setSystem(response.data);
    } catch (err) {
      console.error("Admin system error:", err);
    } finally {
      setSystemLoading(false);
    }
  };

  const loadUsers = async (query = "") => {
    setUsersLoading(true);
    try {
      const response = await adminService.searchUsers(query);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Admin users error:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const openUserEditor = async (userId) => {
    setUserDetailLoading(true);
    setUserActionError("");
    try {
      const response = await adminService.getUser(userId);
      setSelectedUser(response.data.user);
    } catch (err) {
      console.error("Admin user detail error:", err);
      setUserActionError(err.response?.data?.error || "Kullanıcı detayları alınamadı.");
    } finally {
      setUserDetailLoading(false);
    }
  };

  const closeUserEditor = () => {
    setSelectedUser(null);
    setUserActionError("");
  };

  const saveUser = async (payload) => {
    if (!selectedUser?.id) return;
    setUserSaving(true);
    setUserActionError("");
    try {
      const response = await adminService.updateUser(selectedUser.id, payload);
      setSelectedUser(response.data.user);
      await Promise.all([loadUsers(search), loadOverview()]);
      return { ok: true, message: response.data.message };
    } catch (err) {
      console.error("Admin user update error:", err);
      const message = err.response?.data?.error || "Kullanıcı güncellenemedi.";
      setUserActionError(message);
      return { ok: false, message };
    } finally {
      setUserSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOverview();
      loadSystem();
      loadUsers();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AdminLayout
      onLogout={() => {
        authService.logout();
        onLogout();
      }}
    >
      <Routes>
        <Route path="/" element={<OverviewPage overview={overview} loading={loading} error={error} onRefresh={() => { loadOverview(); loadSystem(); }} />} />
        <Route path="/system" element={<SystemPage data={system} loading={systemLoading} />} />
        <Route
          path="/users"
          element={
            <UsersPage
              users={users}
              search={search}
              setSearch={setSearch}
              usersLoading={usersLoading}
              selectedUser={selectedUser}
              userDetailLoading={userDetailLoading}
              userSaving={userSaving}
              userActionError={userActionError}
              onEditUser={openUserEditor}
              onCloseEditor={closeUserEditor}
              onSaveUser={saveUser}
            />
          }
        />
        <Route path="/activity" element={<ActivityPage overview={overview} />} />
      </Routes>
    </AdminLayout>
  );
}
