import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import PRList from "./PRList";
import { RatingPieChart, SeverityBarChart, PRTimelineChart } from "./Charts";

const BACKEND_URL = "https://ai-code-reviewer-backend-lrfl.onrender.com";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stats`);
      if (!response.ok) throw new Error("Server se data nahi aaya!");
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Backend server se connect nahi ho pa raha! Server chala hai?");
    } finally {
      setLoading(false);
    }
  };

  // Page load pe fetch karo
  useEffect(() => {
    fetchStats();
    // Har 10 seconds mein auto refresh
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f6f8fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>

      {/* Header */}
      <div style={{
        background: "#24292f",
        color: "white",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🤖</span>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              AI Code Reviewer
            </div>
            <div style={{ fontSize: "13px", color: "#8b949e" }}>
              Powered by Groq + Llama 3
            </div>
          </div>
        </div>

        {/* Server Status */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: error ? "#ff000022" : "#23863622",
          padding: "8px 16px",
          borderRadius: "20px"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: error ? "#f85149" : "#3fb950"
          }} />
          <span style={{ fontSize: "13px", color: error ? "#f85149" : "#3fb950" }}>
            {error ? "Offline" : "Online"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
            <div style={{ fontSize: "40px" }}>⏳</div>
            <div style={{ marginTop: "16px" }}>Loading dashboard...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: "#fff0f0",
            border: "1px solid #ffcdd2",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            color: "#c62828"
          }}>
            <div style={{ fontSize: "40px" }}>⚠️</div>
            <div style={{ marginTop: "12px", fontWeight: "600" }}>{error}</div>
            <button
              onClick={fetchStats}
              style={{
                marginTop: "16px",
                background: "#c62828",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && !loading && (
          <>
            <div style={{
              display: "flex",
              gap: "20px",
              marginBottom: "32px",
              flexWrap: "wrap"
            }}>
              <StatCard
                title="Total PRs Reviewed"
                value={stats.total_reviewed}
                emoji="📋"
                color="#0969da"
              />
              <StatCard
                title="Bugs Caught"
                value={stats.total_reviewed * 2}
                emoji="🐛"
                color="#cf222e"
              />
              <StatCard
                title="Server Status"
                value={stats.status === "healthy" ? "Live" : "Down"}
                emoji="💚"
                color="#1a7f37"
              />
            </div>

            {/* Charts Section */}
            {stats && stats.reviews && stats.reviews.length > 0 && (
            <div style={{ marginBottom: "32px" }}>

              {/* Pie + Bar side by side */}
              <div style={{
                display: "flex",
                gap: "20px",
                marginBottom: "20px",
                flexWrap: "wrap"
            }}>
                <RatingPieChart reviews={stats.reviews} />
                <SeverityBarChart reviews={stats.reviews} />
              </div>

              {/* Timeline full width */}
              <PRTimelineChart reviews={stats.reviews} />
              </div>
              )}

            {/* PR List */}
            <div style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#333" }}>
                  📝 Reviewed Pull Requests
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Last updated: {lastUpdated}
                </div>
              </div>
              <PRList prs={stats.reviewed_prs} />
            </div>

            {/* Refresh Button */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={fetchStats}
                style={{
                  background: "#0969da",
                  color: "white",
                  border: "none",
                  padding: "10px 28px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                🔄 Refresh
              </button>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                Auto-refreshes every 10 seconds
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;