function StatCard({ title, value, emoji, color }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderLeft: `4px solid ${color}`,
      minWidth: "180px",
      flex: 1
    }}>
      <div style={{ fontSize: "32px" }}>{emoji}</div>
      <div style={{
        fontSize: "36px",
        fontWeight: "bold",
        color: color,
        margin: "8px 0"
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "14px",
        color: "#666",
        fontWeight: "500"
      }}>
        {title}
      </div>
    </div>
  );
}

export default StatCard;