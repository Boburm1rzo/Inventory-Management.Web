import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, ClipboardList, Heart, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { personalApi } from "../api/personal.api";
import type { PersonalStatsDto } from "../types";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import EmptyState from "../components/common/EmptyState";
import InventoryTable from "../components/inventory/InventoryTable";

const PersonalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<PersonalStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchMyStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await personalApi.getMyStats();
      setStats(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load your statistics",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyStats();
    }
  }, [isAuthenticated, fetchMyStats]);

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="personal-container container-fluid max-w-1200 px-4 py-4">
      {/* User Info Header */}
      <div className="profile-header mb-5 animate-fade-up">
        <div className="d-flex align-items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-initials">
              {user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <div>
            <h1 className="user-display-name m-0">{user.displayName}</h1>
            <p className="user-email-text m-0">{user.email}</p>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Stats Cards */}
      <div
        className="stats-grid mb-5 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="stat-card">
          <div className="stat-icon inventories">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? "..." : stats?.totalInventories || 0}
            </div>
            <div className="stat-label">My Inventories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon items">
            <ClipboardList size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? "..." : stats?.totalItems || 0}
            </div>
            <div className="stat-label">My Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon likes">
            <Heart size={24} fill="#ef4444" color="#ef4444" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? "..." : stats?.totalLikes || 0}
            </div>
            <div className="stat-label">Likes received</div>
          </div>
        </div>
      </div>

      {/* Inventories Section */}
      <div
        className="my-inventories-section animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title m-0">My Inventories</h2>
          <Link to="/inventories" className="btn-create-link">
            <Plus size={18} /> Create Inventory
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-table">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-row shimmer-bg" />
            ))}
          </div>
        ) : stats?.inventories && stats.inventories.length > 0 ? (
          <InventoryTable inventories={stats.inventories} showActions={false} />
        ) : (
          <EmptyState
            title="You haven't created any inventories yet"
            message="Start organizing your items by creating your first inventory."
          />
        )}
      </div>

      <style>{`
        .personal-container { color: var(--text-primary); }
        
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid var(--bg-card); box-shadow: var(--shadow-sm); }
        .profile-avatar-initials { 
          width: 80px; height: 80px; border-radius: 50%; background: var(--accent);
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.5rem; border: 4px solid var(--bg-card); box-shadow: var(--shadow-sm);
        }
        .user-display-name { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
        .user-email-text { color: var(--text-secondary); font-size: 1rem; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .stat-card { 
          background: var(--bg-card); border-radius: var(--radius-lg); padding: 1.5rem;
          border: 1px solid var(--border); display: flex; align-items: center; gap: 1.25rem;
          transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .stat-icon { 
          width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; 
          justify-content: center; color: white;
        }
        .stat-icon.inventories { background: var(--accent); }
        .stat-icon.items { background: var(--success); }
        .stat-icon.likes { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .stat-value { font-size: 1.75rem; font-weight: 700; line-height: 1.2; }
        .stat-label { font-size: 0.875rem; color: var(--text-secondary); }

        .section-title { font-size: 1.5rem; font-weight: 700; }
        .btn-create-link { 
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--accent); color: white !important; padding: 8px 16px; 
          border-radius: 8px; font-weight: 600; font-size: 0.875rem; transition: var(--transition);
        }
        .btn-create-link:hover { background: var(--accent-hover); transform: translateY(-1px); }

        .skeleton-row { height: 60px; margin-bottom: 1rem; border-radius: 8px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .profile-header { text-align: center; }
          .profile-header .d-flex { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default PersonalPage;
