import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Package,
  ClipboardList,
  Trash2,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/admin.api";
import type { AdminStatsDto, AdminUserDto } from "../types";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmModal from "../components/common/ConfirmModal";
import Pagination from "../components/common/Pagination";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  // State
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirm modal state
  const [userToDelete, setUserToDelete] = useState<AdminUserDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Constants
  const PAGE_SIZE = 10;

  // Admin protection
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminApi.getAdminStats();
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async (p: number, s: string) => {
    try {
      setUsersLoading(true);
      const result = await adminApi.getUsers(p, PAGE_SIZE, s);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(page, search);
    }
  }, [isAdmin, page, search, fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin) {
        setPage(1);
        fetchUsers(1, search);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, isAdmin, fetchUsers]);

  // Handlers
  const handleBlockToggle = async (targetUser: AdminUserDto) => {
    if (targetUser.id === user?.id) return;
    try {
      if (targetUser.isBlocked) {
        await adminApi.unblockUser(targetUser.id);
      } else {
        await adminApi.blockUser(targetUser.id);
      }
      // Optimistic or simple refetch
      fetchUsers(page, search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteUser(userToDelete.id);
      setUserToDelete(null);
      fetchUsers(page, search);
      fetchStats(); // Update totals
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const chartData =
    stats?.topInventoriesByItems.map((inv) => ({
      name:
        inv.title.length > 15 ? inv.title.substring(0, 15) + "..." : inv.title,
      items: inv.itemCount || 0,
    })) || [];

  if (authLoading || (!isAdmin && authLoading)) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAdmin) return null;

  return (
    <div className="admin-container container-fluid max-w-1200 px-4 py-4">
      <h1 className="mb-4 fw-bold">Admin Panel</h1>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Stats Grid */}
      <div className="stats-grid mb-5">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            {statsLoading ? (
              <div className="skeleton-text" />
            ) : (
              <div className="stat-value">{stats?.totalUsers || 0}</div>
            )}
            <div className="stat-label">Total users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inventories">
            <Package size={24} />
          </div>
          <div className="stat-content">
            {statsLoading ? (
              <div className="skeleton-text" />
            ) : (
              <div className="stat-value">{stats?.totalInventories || 0}</div>
            )}
            <div className="stat-label">Total inventories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon items">
            <ClipboardList size={24} />
          </div>
          <div className="stat-content">
            {statsLoading ? (
              <div className="skeleton-text" />
            ) : (
              <div className="stat-value">{stats?.totalItems || 0}</div>
            )}
            <div className="stat-label">Total items</div>
          </div>
        </div>
      </div>

      <div className="row mb-5 g-4">
        {/* Chart Section */}
        <div className="col-12 col-xl-6">
          <div className="admin-section-card h-100">
            <h3 className="section-title mb-4">Top Inventories by Items</h3>
            <div style={{ width: "100%", height: 250 }}>
              {statsLoading ? (
                <div className="shimmer-bg h-100 rounded-3" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "var(--bg-secondary)" }}
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="items" radius={[4, 4, 0, 0]}>
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--accent)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users List / Search */}
        <div className="col-12 col-xl-6">
          <div className="admin-section-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
              <h3 className="section-title m-0">Users</h3>
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="users-table-wrapper">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th>User</th>
                    <th className="text-center">Inventories</th>
                    <th className="text-center">Items</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5}>
                          <div className="skeleton-row shimmer-bg" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.displayName}
                                className="user-avatar"
                              />
                            ) : (
                              <div className="user-avatar-initials">
                                {u.displayName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            )}
                            <div className="user-info">
                              <div className="user-name">
                                {u.displayName}{" "}
                                {u.id === user?.id && (
                                  <span className="self-badge">(You)</span>
                                )}
                              </div>
                              <div className="user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{u.inventoryCount}</td>
                        <td className="text-center">{u.itemCount}</td>
                        <td className="text-center">
                          <span
                            className={`status-badge ${u.isBlocked ? "blocked" : "active"}`}
                          >
                            {u.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className={`btn-action ${u.isBlocked ? "unblock" : "block"}`}
                              disabled={u.id === user?.id}
                              onClick={() => handleBlockToggle(u)}
                              title={
                                u.isBlocked ? "Unblock user" : "Block user"
                              }
                            >
                              {u.isBlocked ? (
                                <ShieldCheck size={18} />
                              ) : (
                                <ShieldAlert size={18} />
                              )}
                            </button>
                            <button
                              className="btn-action delete"
                              disabled={u.id === user?.id}
                              onClick={() => setUserToDelete(u)}
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={Math.ceil(totalCount / PAGE_SIZE)}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>

      {userToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete.displayName}? This will delete all their inventories and items. This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setUserToDelete(null)}
          isProcessing={isDeleting}
        />
      )}

      <style>{`
        .admin-container { color: var(--text-primary); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .stat-card { 
          background: var(--bg-card); border-radius: var(--radius-lg); padding: 1.5rem;
          border: 1px solid var(--border); display: flex; align-items: center; gap: 1.25rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .stat-icon { 
          width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; 
          justify-content: center; color: white;
        }
        .stat-icon.users { background: #4361ee; }
        .stat-icon.inventories { background: #10b981; }
        .stat-icon.items { background: #f59e0b; }
        .stat-value { font-size: 2rem; font-weight: 700; line-height: 1.2; }
        .stat-label { font-size: 0.875rem; color: var(--text-secondary); }
        
        .admin-section-card { 
          background: var(--bg-card); border-radius: var(--radius-lg); padding: 1.5rem;
          border: 1px solid var(--border);
        }
        .section-title { font-size: 1.25rem; font-weight: 700; }
        
        .search-box { position: relative; }
        .search-box .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box input { 
          padding: 8px 12px 8px 36px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--bg-primary); color: var(--text-primary); font-size: 0.875rem;
          width: 240px; outline: none; transition: border-color 0.2s;
        }
        .search-box input:focus { border-color: var(--accent); }
        
        .admin-table th { 
          font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);
          padding: 12px 8px; border-bottom: 2px solid var(--border);
        }
        .admin-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .user-avatar-initials { 
          width: 40px; height: 40px; border-radius: 50%; background: var(--accent);
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.875rem;
        }
        .user-name { font-weight: 600; font-size: 0.9375rem; }
        .user-email { font-size: 0.8125rem; color: var(--text-muted); }
        .self-badge { font-size: 0.75rem; color: var(--accent); font-weight: normal; }
        
        .status-badge { 
          padding: 4px 10px; border-radius: 50rem; font-size: 0.75rem; font-weight: 600;
        }
        .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.blocked { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .btn-action { 
          width: 32px; height: 32px; border-radius: 8px; border: none; 
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition); cursor: pointer;
        }
        .btn-action.block { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .btn-action.block:hover { background: #f59e0b; color: white; }
        .btn-action.unblock { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .btn-action.unblock:hover { background: #10b981; color: white; }
        .btn-action.delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .btn-action.delete:hover { background: #ef4444; color: white; }
        .btn-action:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .skeleton-text { width: 60px; height: 2rem; background: var(--bg-secondary); border-radius: 4px; }
        .skeleton-row { height: 40px; border-radius: 8px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .search-box input { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
