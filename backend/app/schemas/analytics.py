from pydantic import BaseModel, field_serializer
from datetime import datetime, timezone
from typing import List, Optional

class VoteTrendItem(BaseModel):
    date: str
    votes: int
    polls: int

class VoteTrendResponse(BaseModel):
    trends: List[VoteTrendItem]

class ActivityItem(BaseModel):
    id: str
    type: str  # vote, like, share, created, follow
    user_id: int
    username: str
    poll_id: Optional[int] = None
    poll_title: Optional[str] = None
    timestamp: datetime
    metadata: Optional[str] = None
    
    @field_serializer('timestamp')
    @classmethod
    def serialize_timestamp(cls, value: datetime) -> str:
        # Ensure timezone-aware and serialize to ISO format with Z suffix
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()

class ActivityFeedResponse(BaseModel):
    activities: List[ActivityItem]
    total: int

class EngagementMetrics(BaseModel):
    total_polls: int
    active_polls: int
    closed_polls: int
    total_votes: int
    total_likes: int
    avg_votes_per_poll: float
    avg_options_per_poll: float
    participation_rate: float

class AnalyticsDashboardResponse(BaseModel):
    metrics: EngagementMetrics
    vote_trends: List[VoteTrendItem]
    recent_activities: List[ActivityItem]


class PollEngagementItem(BaseModel):
    poll_id: int
    title: str
    votes: int
    likes: int
    engagement_rate: float
    created_at: str


class TopPollsResponse(BaseModel):
    polls: List[PollEngagementItem]
