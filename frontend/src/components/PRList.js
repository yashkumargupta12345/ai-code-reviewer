function PRList({ prs }) {
  if (prs.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px",
        color: "#999"
      }}>
        No PRs reviewed yet! Create a PR to get started 🚀
      </div>
    );
  }

  return (
    <div>
      {prs.map((pr, index) => {
        // "yashkumargupta12345/test-ai-reviewer#1" format parse karo
        const parts = pr.split("#");
        const repo = parts[0];
        const prNumber = parts[1];

        return (
          <div key={index} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            transition: "background 0.2s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>🔀</span>
              <div>
                <div style={{ fontWeight: "600", color: "#333" }}>
                  PR #{prNumber}
                </div>
                <div style={{ fontSize: "13px", color: "#888" }}>
                  {repo}
                </div>
              </div>
            </div>
            
              <a href={`https://github.com/${repo}/pull/${prNumber}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#238636",
                color: "white",
                padding: "6px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "500"
              }} >
              View PR →
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default PRList;