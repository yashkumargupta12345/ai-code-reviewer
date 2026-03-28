import { useState, useEffect } from "react";
import { RatingPieChart, SeverityBarChart, PRTimelineChart } from "./Charts";

const BACKEND_URL = "https://ai-code-reviewer-backend-lrfl.onrender.com";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, emoji, color, subtitle }) {
  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      padding: "20px 24px",
      flex: 1,
      minWidth: "160px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, border-color 0.2s",
      cursor: "default"
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#30363d";
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: color,
        borderRadius: "12px 12px 0 0"
      }} />

      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{emoji}</div>
      <div style={{
        fontSize: "32px",
        fontWeight: "700",
        color: color,
        lineHeight: 1
      }}>{value}</div>
      <div style={{
        fontSize: "14px",
        color: "#8b949e",
        marginTop: "6px",
        fontWeight: "500"
      }}>{title}</div>
      {subtitle && (
        <div style={{
          fontSize: "12px",
          color: "#6e7681",
          marginTop: "4px"
        }}>{subtitle}</div>
      )}
    </div>
  );
}

// ─── PR List Item ─────────────────────────────────────────────────────────────

// ─── Repo Group Component ─────────────────────────────────────────────────────
function RepoGroup({ repoName, reviews }) {
  const [collapsed, setCollapsed] = useState(false);

  const criticalCount = reviews.filter(r => r.rating === "critical").length;
  const avgScore = (reviews.reduce((a, b) => a + b.severity_score, 0) / reviews.length).toFixed(1);
  const avgScoreColor = avgScore >= 8 ? "#f85149" :
                        avgScore >= 5 ? "#d29922" : "#3fb950";

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "16px"
    }}>
      {/* Repo Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "16px 20px",
          borderBottom: collapsed ? "none" : "1px solid #21262d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          transition: "background 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#1c2128"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Left — Repo Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>📁</span>
          <div>
            <div style={{
              fontWeight: "700",
              fontSize: "15px",
              color: "#79c0ff"
            }}>
              {repoName}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#8b949e",
              marginTop: "2px"
            }}>
              {reviews.length} PR{reviews.length > 1 ? "s" : ""} reviewed
            </div>
          </div>
        </div>

        {/* Right — Stats + Collapse */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Critical badge */}
          {criticalCount > 0 && (
            <div style={{
              background: "#f8514922",
              border: "1px solid #f8514944",
              color: "#f85149",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              🚨 {criticalCount} Critical
            </div>
          )}

          {/* Avg Score */}
          <div style={{
            background: `${avgScoreColor}22`,
            border: `1px solid ${avgScoreColor}44`,
            color: avgScoreColor,
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            Avg: {avgScore}/10
          </div>

          {/* Collapse arrow */}
          <span style={{
            color: "#8b949e",
            fontSize: "14px",
            transition: "transform 0.2s",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)"
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* PR List — Collapsible */}
      {!collapsed && reviews.map((review, index) => (
        <PRItem key={index} review={review} />
      ))}
    </div>
  );
}


function PRItem({ review }) {
  const ratingColor = {
    good: "#3fb950",
    needs_work: "#d29922",
    critical: "#f85149"
  }[review.rating] || "#8b949e";

  const ratingEmoji = {
    good: "✅",
    needs_work: "⚠️",
    critical: "🚨"
  }[review.rating] || "⚠️";

  const scoreColor = review.severity_score >= 8 ? "#f85149" :
                     review.severity_score >= 5 ? "#d29922" : "#3fb950";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: "1px solid #21262d",
      transition: "background 0.15s",
      flexWrap: "wrap",
      gap: "12px"
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#161b22"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>🔀</span>
        <div>
          <div style={{
            fontWeight: "600",
            color: "#e6edf3",
            fontSize: "15px"
          }}>
            PR #{review.pr_number}
            <span style={{
              marginLeft: "8px",
              fontSize: "12px",
              background: `${ratingColor}22`,
              color: ratingColor,
              padding: "2px 8px",
              borderRadius: "12px",
              border: `1px solid ${ratingColor}44`
            }}>
              {ratingEmoji} {review.rating?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div style={{
            fontSize: "13px",
            color: "#8b949e",
            marginTop: "2px"
          }}>
            {review.repo_name} • {review.reviewed_at}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Severity Score */}
        <div style={{
          background: `${scoreColor}22`,
          border: `1px solid ${scoreColor}44`,
          color: scoreColor,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600"
        }}>
          {review.severity_score}/10
        </div>

        {/* Language Badge */}
        {review.language && review.language !== "unknown" && (
          <div style={{
            background: "#1f6feb22",
            border: "1px solid #1f6feb44",
            color: "#79c0ff",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "13px"
          }}>
            {review.language}
          </div>
        )}

        {/* View PR Button */}
        
          <a href={`https://github.com/${review.repo_name}/pull/${review.pr_number}`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: "#238636",
            color: "white",
            padding: "6px 16px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: "500",
            border: "1px solid #2ea043",
            transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#2ea043"}
          onMouseLeave={e => e.currentTarget.style.background = "#238636"}
        >
          View PR →
        </a>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const RATE_LIMIT = 10;

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stats`);
      if (!response.ok) throw new Error("Server error!");
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Backend connect nahi ho raha!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Stats calculate karo
  const criticalCount = stats?.reviews?.filter(r => r.rating === "critical").length || 0;
  const avgScore = stats?.reviews?.length
    ? (stats.reviews.reduce((a, b) => a + b.severity_score, 0) / stats.reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117" }}>

      {/* ── Header ── */}
      <div style={{
        background: "#161b22",
        borderBottom: "1px solid #30363d",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>🤖</span>
            <div>
              <span style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#e6edf3"
              }}>AI Code Reviewer</span>
              <span style={{
                marginLeft: "8px",
                fontSize: "12px",
                background: "#1f6feb22",
                color: "#79c0ff",
                padding: "2px 8px",
                borderRadius: "12px",
                border: "1px solid #1f6feb44"
              }}>Beta</span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: error ? "#f85149" : "#3fb950",
                boxShadow: error ? "0 0 6px #f85149" : "0 0 6px #3fb950"
              }} />
              <span style={{
                fontSize: "13px",
                color: error ? "#f85149" : "#3fb950"
              }}>
                {error ? "Offline" : "Live"}
              </span>
            </div>

            {lastUpdated && (
              <span style={{ fontSize: "12px", color: "#6e7681" }}>
                Updated {lastUpdated}
              </span>
            )}

            {/* Refresh Button */}
            <button onClick={fetchStats} style={{
              background: "transparent",
              border: "1px solid #30363d",
              color: "#e6edf3",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "border-color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#8b949e"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px"
      }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px", color: "#8b949e" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div>Loading dashboard...</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "#f8514922",
            border: "1px solid #f8514944",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            color: "#f85149"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontWeight: "600", fontSize: "16px" }}>{error}</div>
            <button onClick={fetchStats} style={{
              marginTop: "16px",
              background: "#f85149",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: "pointer"
            }}>Retry</button>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* ── Page Title ── */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#e6edf3"
              }}>
                Dashboard
              </h1>
              <p style={{
                color: "#8b949e",
                fontSize: "14px",
                marginTop: "4px"
              }}>
                Powered by Groq + Llama 3.3 70B
              </p>
            </div>

            {/* ── Stats Cards ── */}
            <div style={{
              display: "flex",
              gap: "16px",
              marginBottom: "28px",
              flexWrap: "wrap"
            }}>
              <StatCard
                title="Total PRs Reviewed"
                value={stats.total_reviewed}
                emoji="📋"
                color="#79c0ff"
              />
              <StatCard
                title="Critical PRs"
                value={criticalCount}
                emoji="🚨"
                color="#f85149"
                subtitle="Needs immediate attention"
              />
              <StatCard
                title="Avg Severity"
                value={`${avgScore}/10`}
                emoji="🎯"
                color="#d29922"
              />
              <StatCard
                title="Server Status"
                value="Live"
                emoji="💚"
                color="#3fb950"
                subtitle="Auto-refresh every 10s"
              />
              <StatCard
                title="Rate Limit"
                value={`${RATE_LIMIT}/min`}
                emoji="🚦"
                color="#a371f7"
                subtitle="Per repo limit"
              />
            </div>

            {/* ── Charts ── */}
            {stats.reviews && stats.reviews.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "16px",
                  flexWrap: "wrap"
                }}>
                  <RatingPieChart reviews={stats.reviews} />
                  <SeverityBarChart reviews={stats.reviews} />
                </div>
                <PRTimelineChart reviews={stats.reviews} />
              </div>
            )}

            {/* ── PR List ── */}
            {/* ── Multi Repo PR List ── */}
            {stats.reviews && stats.reviews.length > 0 && (
              <div>
                {/* Section Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#e6edf3"
                  }}>
                    📝 Reviewed Pull Requests
                  </h2>
                  <div style={{
                    background: "#30363d",
                    color: "#8b949e",
                    padding: "3px 12px",
                    borderRadius: "12px",
                    fontSize: "13px"
                  }}>
                    {Object.keys(
                      stats.reviews.reduce((acc, r) => {
                        acc[r.repo_name] = true;
                        return acc;
                      }, {})
                    ).length} repos • {stats.total_reviewed} PRs
                  </div>
                </div>

                {/* Repo Groups */}
                {Object.entries(
                  stats.reviews.reduce((acc, review) => {
                    if (!acc[review.repo_name]) acc[review.repo_name] = [];
                    acc[review.repo_name].push(review);
                    return acc;
                  }, {})
                ).map(([repoName, repoReviews]) => (
                  <RepoGroup
                    key={repoName}
                    repoName={repoName}
                    reviews={repoReviews}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!stats.reviews || stats.reviews.length === 0) && (
              <div style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                textAlign: "center",
                padding: "60px",
                color: "#8b949e"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#e6edf3" }}>
                  No PRs reviewed yet!
                </div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  Add webhook to any GitHub repo and create a PR to get started.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;