from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ─── Table Definition ─────────────────────────────────────────────────────────
class ReviewedPR(Base):
    __tablename__ = "reviewed_prs"

    id = Column(Integer, primary_key=True)
    repo_name = Column(String)        # "yashkumargupta/test-repo"
    pr_number = Column(Integer)       # 5
    rating = Column(String)           # "critical"
    severity_score = Column(Integer)  # 9
    language = Column(String)         # "python"
    reviewed_at = Column(DateTime, default=datetime.utcnow)

# ─── Table Banao ──────────────────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(engine)
    print("✅ Database tables created!")

# ─── PR Save Karo ─────────────────────────────────────────────────────────────
def save_review(repo_name: str, pr_number: int, review: dict):
    db = SessionLocal()
    try:
        pr = ReviewedPR(
            repo_name=repo_name,
            pr_number=pr_number,
            rating=review.get("rating", "unknown"),
            severity_score=review.get("severity_score", 0),
            language=review.get("detected_language", "unknown"),
        )
        db.add(pr)
        db.commit()
        print(f"💾 PR saved to database!")
    except Exception as e:
        print(f"💥 Database error: {e}")
        db.rollback()
    finally:
        db.close()

# ─── Saare PRs Lo ─────────────────────────────────────────────────────────────
def get_all_reviews() -> list:
    db = SessionLocal()
    try:
        reviews = db.query(ReviewedPR).order_by(ReviewedPR.reviewed_at.desc()).all()
        return [
            {
                "repo_name": r.repo_name,
                "pr_number": r.pr_number,
                "rating": r.rating,
                "severity_score": r.severity_score,
                "language": r.language,
                "reviewed_at": r.reviewed_at.strftime("%Y-%m-%d %H:%M")
            }
            for r in reviews
        ]
    finally:
        db.close()

# ─── PR Already Reviewed Hai? ─────────────────────────────────────────────────
def is_already_reviewed(repo_name: str, pr_number: int) -> bool:
    db = SessionLocal()
    try:
        exists = db.query(ReviewedPR).filter(
            ReviewedPR.repo_name == repo_name,
            ReviewedPR.pr_number == pr_number
        ).first()
        return exists is not None
    finally:
        db.close()