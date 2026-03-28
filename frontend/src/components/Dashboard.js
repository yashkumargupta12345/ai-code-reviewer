import { useState, useEffect } from "react";
import { RatingPieChart, SeverityBarChart, PRTimelineChart } from "./Charts";

const BACKEND_URL = "https://ai-code-reviewer-backend-lrfl.onrender.com";
const RATE_LIMIT = 10;

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, emoji, gradient, subtitle }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "24px",
        flex: 1,
        minWidth: "160px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.2)",
        cursor: "default"
      }}
    >
      {/* Gradient top border */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: gradient,
        borderRadius: "20px 20px 0 0"
      }} />

      {/* Glow blob */}
      <div style={{
        position: "absolute",
        top: "-20px", right: "-20px",
        width: "80px", height: "80px",
        background: gradient,
        borderRadius: "50%",
        opacity: hovered ? 0.15 : 0.08,
        filter: "blur(20px)",
        transition: "opacity 0.3s"
      }} />

      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{emoji}</div>
      <div style={{
        fontSize: "36px",
        fontWeight: "800",
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
        marginBottom: "6px"
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        fontWeight: "500"
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.3)",
          marginTop: "4px"
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ─── PR Item ──────────────────────────────────────────────────────────────────
function PRItem({ review }) {
  const [hovered, setHovered] = useState(false);

  const ratingConfig = {
    good: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", emoji: "✅" },
    needs_work: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", emoji: "⚠️" },
    critical: { color: "#f87171", bg: "rgba(248,113,113,0.1)", emoji: "🚨" }
  }[review.rating] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", emoji: "⚠️" };

  const scoreColor = review.severity_score >= 8 ? "#f87171" :
                     review.severity_score >= 5 ? "#fbbf24" : "#4ade80";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        transition: "background 0.2s",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "40px", height: "40px",
          background: ratingConfig.bg,
          border: `1px solid ${ratingConfig.color}33`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px"
        }}>
          {ratingConfig.emoji}
        </div>
        <div>
          <div style={{
            fontWeight: "600",
            color: "#e2e8f0",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            PR #{review.pr_number}
            <span style={{
              fontSize: "11px",
              background: ratingConfig.bg,
              color: ratingConfig.color,
              padding: "2px 8px",
              borderRadius: "20px",
              border: `1px solid ${ratingConfig.color}33`,
              fontWeight: "600"
            }}>
              {review.rating?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            marginTop: "3px"
          }}>
            {review.repo_name} • {review.reviewed_at}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          background: `${scoreColor}15`,
          border: `1px solid ${scoreColor}33`,
          color: scoreColor,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700"
        }}>
          {review.severity_score}/10
        </div>

        {review.language && review.language !== "unknown" && (
          <div style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px"
          }}>
            {review.language}
          </div>
        )}

        
          <a href={`https://github.com/${review.repo_name}/pull/${review.pr_number}`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            padding: "6px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: "600",
            transition: "opacity 0.2s"
          }}
        >
          View →
        </a>
      </div>
    </div>
  );
}

// ─── Repo Group ───────────────────────────────────────────────────────────────
function RepoGroup({ repoName, reviews }) {
  const [collapsed, setCollapsed] = useState(false);

  const criticalCount = reviews.filter(r => r.rating === "critical").length;
  const avgScore = (reviews.reduce((a, b) => a + b.severity_score, 0) / reviews.length).toFixed(1);
  const avgColor = avgScore >= 8 ? "#f87171" : avgScore >= 5 ? "#fbbf24" : "#4ade80";

  return (
    <GlassCard style={{ overflow: "hidden", marginBottom: "16px" }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>📁</span>
          <div>
            <div style={{
              fontWeight: "700",
              fontSize: "14px",
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {repoName}
            </div>
            <div style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "2px"
            }}>
              {reviews.length} PR{reviews.length > 1 ? "s" : ""} reviewed
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {criticalCount > 0 && (
            <span style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              🚨 {criticalCount}
            </span>
          )}
          <span style={{
            background: `${avgColor}15`,
            border: `1px solid ${avgColor}33`,
            color: avgColor,
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            Avg {avgScore}/10
          </span>
          <span style={{
            color: "rgba(255,255,255,0.3)",
            transition: "transform 0.2s",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            display: "inline-block"
          }}>▼</span>
        </div>
      </div>

      {!collapsed && reviews.map((review, i) => (
        <PRItem key={i} review={review} />
      ))}
    </GlassCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/stats`);
      if (!res.ok) throw new Error("Server error!");
      const data = await res.json();
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

  const criticalCount = stats?.reviews?.filter(r => r.rating === "critical").length || 0;
  const avgScore = stats?.reviews?.length
    ? (stats.reviews.reduce((a, b) => a + b.severity_score, 0) / stats.reviews.length).toFixed(1)
    : 0;

  const repoGroups = stats?.reviews
    ? Object.entries(
        stats.reviews.reduce((acc, r) => {
          if (!acc[r.repo_name]) acc[r.repo_name] = [];
          acc[r.repo_name].push(r);
          return acc;
        }, {})
      )
    : [];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,15,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 32px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 0 20px rgba(139,92,246,0.4)"
            }}>
              🤖
            </div>
            <div>
              <div style={{
                fontWeight: "800",
                fontSize: "15px",
                background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                AI Code Reviewer
              </div>
              <div style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)"
              }}>
                Powered by Groq + Llama 3.3 70B
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: error ? "#f87171" : "#4ade80",
                boxShadow: error
                  ? "0 0 8px #f87171"
                  : "0 0 8px #4ade80",
                animation: error ? "none" : "pulse 2s infinite"
              }} />
              <span style={{
                fontSize: "12px",
                color: error ? "#f87171" : "#4ade80",
                fontWeight: "600"
              }}>
                {error ? "Offline" : "Live"}
              </span>
            </div>

            {lastUpdated && (
              <span style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.25)"
              }}>
                {lastUpdated}
              </span>
            )}

            <button
              onClick={fetchStats}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                padding: "7px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.2s",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 32px"
      }}>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "100px",
            color: "rgba(255,255,255,0.3)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div>Loading dashboard...</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <GlassCard style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
            <div style={{ color: "#f87171", fontWeight: "600" }}>{error}</div>
            <button
              onClick={fetchStats}
              style={{
                marginTop: "16px",
                background: "linear-gradient(135deg, #f87171, #ef4444)",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Retry
            </button>
          </GlassCard>
        )}

        {stats && !loading && (
          <>
            {/* Page Title */}
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #e2e8f0, rgba(255,255,255,0.5))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "6px"
              }}>
                Dashboard
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "14px"
              }}>
                {stats.total_reviewed} PRs reviewed across {repoGroups.length} repo{repoGroups.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{
              display: "flex",
              gap: "16px",
              marginBottom: "32px",
              flexWrap: "wrap"
            }}>
              <StatCard
                title="Total PRs Reviewed"
                value={stats.total_reviewed}
                emoji="📋"
                gradient="linear-gradient(135deg, #60a5fa, #3b82f6)"
              />
              <StatCard
                title="Critical PRs"
                value={criticalCount}
                emoji="🚨"
                gradient="linear-gradient(135deg, #f87171, #ef4444)"
                subtitle="Needs immediate attention"
              />
              <StatCard
                title="Avg Severity"
                value={`${avgScore}/10`}
                emoji="🎯"
                gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"
              />
              <StatCard
                title="Repos Tracked"
                value={repoGroups.length}
                emoji="📁"
                gradient="linear-gradient(135deg, #a78bfa, #8b5cf6)"
              />
              <StatCard
                title="Rate Limit"
                value={`${RATE_LIMIT}/min`}
                emoji="🚦"
                gradient="linear-gradient(135deg, #34d399, #10b981)"
                subtitle="Per repo"
              />
            </div>

            {/* Charts */}
            {stats.reviews && stats.reviews.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
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

            {/* PR List */}
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.7)"
                }}>
                  📝 Reviewed Pull Requests
                </h2>
                <div style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px"
                }}>
                  {repoGroups.length} repos • {stats.total_reviewed} PRs
                </div>
              </div>

              {repoGroups.length > 0 ? (
                repoGroups.map(([repoName, reviews]) => (
                  <RepoGroup key={repoName} repoName={repoName} reviews={reviews} />
                ))
              ) : (
                <GlassCard style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.6)"
                  }}>
                    No PRs reviewed yet!
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: "8px"
                  }}>
                    Add webhook to any GitHub repo and create a PR to get started.
                  </div>
                </GlassCard>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;