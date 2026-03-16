import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Package, Heart } from "lucide-react";

interface StatisticsTabProps {
  inventoryId: number;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ inventoryId }) => {
  // Mock data generation moved to useMemo to be pure during render
  const mockData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      count: Math.floor(Math.random() * 5),
    }));
  }, []);

  const stats = useMemo(() => {
    return {
      totalItems: 45 + (inventoryId % 10), // Mock
      totalLikes: 128, // Mock
    };
  }, [inventoryId]);

  return (
    <div className="statistics-tab">
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-info h4 {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-info p {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .chart-container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .chart-header {
          margin-bottom: 1.5rem;
        }
        .chart-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
      `}</style>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0ea5e9" }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Items</h4>
            <p>{stats.totalItems.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff1f2", color: "#f43f5e" }}>
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Likes</h4>
            <p>{stats.totalLikes.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3>Items Added Over Time</h3>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
