from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from typing import List
from app.db.database import get_db
from app.models.poll import Poll
from app.models.vote import Vote
from app.models.like import Like
from app.models.option import Option
from app.models.user import User
from app.schemas.analytics import (
    VoteTrendItem,
    VoteTrendResponse,
    ActivityItem,
    ActivityFeedResponse,
    EngagementMetrics,
    AnalyticsDashboardResponse,
    PollEngagementItem,
    TopPollsResponse,
)

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(db: Session = Depends(get_db)):
    """Get all analytics data for the dashboard."""
    
    # Get engagement metrics
    total_polls = db.query(Poll).count()
    active_polls = db.query(Poll).filter(Poll.is_active == True).count()
    closed_polls = total_polls - active_polls
    total_votes = db.query(Vote).count()
    total_likes = db.query(Like).count()
    
    # Calculate averages
    avg_votes_per_poll = total_votes / total_polls if total_polls > 0 else 0
    total_options = db.query(Option).count()
    avg_options_per_poll = total_options / total_polls if total_polls > 0 else 0
    participation_rate = (total_votes / (total_polls * 100)) * 100 if total_polls > 0 else 0
    
    metrics = EngagementMetrics(
        total_polls=total_polls,
        active_polls=active_polls,
        closed_polls=closed_polls,
        total_votes=total_votes,
        total_likes=total_likes,
        avg_votes_per_poll=round(avg_votes_per_poll, 2),
        avg_options_per_poll=round(avg_options_per_poll, 2),
        participation_rate=round(participation_rate, 2),
    )
    
    # Get vote trends for last 7 days
    vote_trends = get_vote_trends(db, days=7)
    
    # Get recent activities
    recent_activities = get_recent_activities(db, limit=20)
    
    return AnalyticsDashboardResponse(
        metrics=metrics,
        vote_trends=vote_trends,
        recent_activities=recent_activities,
    )

@router.get("/vote-trends", response_model=VoteTrendResponse)
def get_vote_trends_endpoint(days: int = 7, db: Session = Depends(get_db)):
    """Get vote trends for the specified number of days."""
    trends = get_vote_trends(db, days=days)
    return VoteTrendResponse(trends=trends)

def get_vote_trends(db: Session, days: int = 7) -> List[VoteTrendItem]:
    """Helper function to calculate vote trends."""
    today = datetime.now(timezone.utc).date()
    trends = []
    
    for i in range(days):
        date = today - timedelta(days=days - 1 - i)
        date_start = datetime.combine(date, datetime.min.time())
        date_end = datetime.combine(date, datetime.max.time())
        
        # Count new polls created on this date
        polls_count = db.query(Poll).filter(
            Poll.created_at >= date_start,
            Poll.created_at <= date_end
        ).count()
        
        # Count votes on this date
        votes_count = db.query(Vote).filter(
            Vote.created_at >= date_start,
            Vote.created_at <= date_end
        ).count()
        
        trends.append(VoteTrendItem(
            date=date.isoformat(),
            votes=votes_count,
            polls=polls_count,
        ))
    
    return trends

@router.get("/activities", response_model=ActivityFeedResponse)
def get_activities(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """Get recent activities (votes, likes, poll creations)."""
    activities = get_recent_activities(db, limit=limit, offset=offset)
    total = get_total_activities_count(db)
    
    return ActivityFeedResponse(
        activities=activities,
        total=total,
    )

def get_recent_activities(db: Session, limit: int = 50, offset: int = 0) -> List[ActivityItem]:
    """Helper function to get recent activities."""
    activities = []
    
    # Get recent votes
    recent_votes = db.query(Vote).order_by(desc(Vote.created_at)).offset(offset).limit(limit).all()
    for vote in recent_votes:
        poll = db.query(Poll).filter(Poll.id == vote.poll_id).first()
        user = db.query(User).filter(User.id == vote.user_id).first()
        activities.append(ActivityItem(
            id=f"vote_{vote.id}",
            type="vote",
            user_id=vote.user_id,
            username=user.username if user else f"user_{vote.user_id}",
            poll_id=vote.poll_id,
            poll_title=poll.title if poll else None,
            timestamp=vote.created_at.isoformat() if vote.created_at else datetime.now(timezone.utc).isoformat(),
        ))
    
    # Get recent likes
    recent_likes = db.query(Like).order_by(desc(Like.created_at)).offset(offset).limit(limit).all()
    for like in recent_likes:
        poll = db.query(Poll).filter(Poll.id == like.poll_id).first()
        user = db.query(User).filter(User.id == like.user_id).first()
        activities.append(ActivityItem(
            id=f"like_{like.id}",
            type="like",
            user_id=like.user_id,
            username=user.username if user else f"user_{like.user_id}",
            poll_id=like.poll_id,
            poll_title=poll.title if poll else None,
            timestamp=like.created_at.isoformat() if like.created_at else datetime.now(timezone.utc).isoformat(),
        ))
    
    # Get recent poll creations
    recent_polls = db.query(Poll).order_by(desc(Poll.created_at)).offset(offset).limit(limit).all()
    for poll in recent_polls:
        user = db.query(User).filter(User.id == poll.creator_id).first()
        activities.append(ActivityItem(
            id=f"created_{poll.id}",
            type="created",
            user_id=poll.creator_id,
            username=user.username if user else f"user_{poll.creator_id}",
            poll_id=poll.id,
            poll_title=poll.title,
            timestamp=poll.created_at.isoformat() if poll.created_at else datetime.now(timezone.utc).isoformat(),
        ))
    
    # Sort all activities by timestamp and limit
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:limit]

def get_total_activities_count(db: Session) -> int:
    """Get total count of all activities."""
    votes_count = db.query(Vote).count()
    likes_count = db.query(Like).count()
    polls_count = db.query(Poll).count()
    return votes_count + likes_count + polls_count

@router.get("/metrics", response_model=EngagementMetrics)
def get_engagement_metrics(db: Session = Depends(get_db)):
    """Get engagement metrics."""
    total_polls = db.query(Poll).count()
    active_polls = db.query(Poll).filter(Poll.is_active == True).count()
    closed_polls = total_polls - active_polls
    total_votes = db.query(Vote).count()
    total_likes = db.query(Like).count()
    
    avg_votes_per_poll = total_votes / total_polls if total_polls > 0 else 0
    total_options = db.query(Option).count()
    avg_options_per_poll = total_options / total_polls if total_polls > 0 else 0
    participation_rate = (total_votes / (total_polls * 100)) * 100 if total_polls > 0 else 0
    
    return EngagementMetrics(
        total_polls=total_polls,
        active_polls=active_polls,
        closed_polls=closed_polls,
        total_votes=total_votes,
        total_likes=total_likes,
        avg_votes_per_poll=round(avg_votes_per_poll, 2),
        avg_options_per_poll=round(avg_options_per_poll, 2),
        participation_rate=round(participation_rate, 2),
    )

@router.get("/top-polls", response_model=TopPollsResponse)
def get_top_polls(db: Session = Depends(get_db)):
    """Get top performing polls by engagement."""
    # Get all polls with their vote and like counts
    polls = db.query(Poll).all()
    
    top_polls = []
    for poll in polls:
        votes_count = db.query(Vote).filter(Vote.poll_id == poll.id).count()
        likes_count = db.query(Like).filter(Like.poll_id == poll.id).count()
        
        # Calculate engagement rate (votes + likes) / time since creation
        if poll.created_at:
            now = datetime.now(timezone.utc)
            age_days = (now - poll.created_at.replace(tzinfo=timezone.utc)).days
            age_days = max(age_days, 1)  # Avoid division by zero
            engagement_rate = ((votes_count + likes_count) / age_days) * 10  # Rate per 10 days
        else:
            engagement_rate = 0
        
        top_polls.append(PollEngagementItem(
            poll_id=poll.id,
            title=poll.title,
            votes=votes_count,
            likes=likes_count,
            engagement_rate=round(min(engagement_rate, 100), 1),  # Cap at 100%
            created_at=poll.created_at.isoformat() if poll.created_at else datetime.now(timezone.utc).isoformat(),
        ))
    
    # Sort by engagement rate descending
    top_polls.sort(key=lambda x: x.engagement_rate, reverse=True)
    
    return TopPollsResponse(polls=top_polls[:10])
