import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

// ─── Pie Chart — Rating Distribution ─────────────────────────────────────────
export function RatingPieChart({ reviews }) {
  // Ratings count karo
  const counts = { good: 0, needs_work: 0, critical: 0 };
  reviews.forEach(r => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
    else counts["needs_work"]++;
  });

  const data = [
    { name: "Good", value: counts.good, color: "#22c55e" },
    { name: "Needs Work", value: counts.needs_work, color: "#f59e0b" },
    { name: "Critical", value: counts.critical, color: "#ef4444" },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      flex: 1,
      color: "rgba(255,255,255,0.8)"
    }}>
      <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#8b949e" }}>
        📊 Rating Distribution
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Bar Chart — Severity Scores ─────────────────────────────────────────────
export function SeverityBarChart({ reviews }) {
  const data = reviews.map(r => ({
    name: `PR #${r.pr_number}`,
    score: r.severity_score,
    fill: r.severity_score >= 8 ? "#ef4444" :
          r.severity_score >= 5 ? "#f59e0b" : "#22c55e"
  }));

  if (data.length === 0) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      flex: 1,
      color: "rgba(255,255,255,0.8)"  
    }}>
      <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#8b949e" }}>
        🎯 Severity Scores
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Bar dataKey="score">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Line Chart — PRs Over Time ───────────────────────────────────────────────
export function PRTimelineChart({ reviews }) {
  // Date ke hisaab se group karo
  const dateCount = {};
  reviews.forEach(r => {
    const date = r.reviewed_at.split(" ")[0];
    dateCount[date] = (dateCount[date] || 0) + 1;
  });

  const data = Object.entries(dateCount)
    .sort()
    .map(([date, count]) => ({ date, count }));

  if (data.length === 0) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      width: "100%",
      color: "rgba(255,255,255,0.8)"
    }}>
      <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#8b949e" }}>
        📈 PRs Reviewed Over Time
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0969da"
            strokeWidth={2}
            dot={{ fill: "#0969da", r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}