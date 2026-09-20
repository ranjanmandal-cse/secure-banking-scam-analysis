from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime

from app.database.database import Base


class InvestigationCase(Base):

    __tablename__ = "investigation_cases"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    case_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    source_type = Column(
        String,
        nullable=False
    )

    filename = Column(
        String,
        nullable=True
    )

    evidence_text = Column(
        Text,
        nullable=False
    )

    risk_score = Column(
        Integer,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    indicators = Column(
        Text,
        nullable=False
    )

    entities = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        default="OPEN"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )