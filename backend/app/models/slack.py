"""
Slack Integration Schemas
Pydantic models for Slack API data structures.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class SlackCredentialsSchema(BaseModel):
    """Schema for Slack API credentials."""
    bot_token: str = Field(default=os.getenv("SLACK_BOT_TOKEN", ""), description="Bot User OAuth Token from Slack")
    app_token: Optional[str] = Field(default=os.getenv("SLACK_APP_TOKEN", None), description="App-level token for advanced features")
    signing_secret: Optional[str] = Field(default=os.getenv("SLACK_SIGNING_SECRET", None), description="Signing secret for verifying requests")
    client_id: Optional[str] = Field(default=os.getenv("SLACK_CLIENT_ID", None), description="Client ID for OAuth")
    client_secret: Optional[str] = Field(default=os.getenv("SLACK_CLIENT_SECRET", None), description="Client Secret for OAuth")
    
    class Config:
        schema_extra = {
            "example": {
                "bot_token": "",
                "app_token": "",
                "signing_secret": "",
                "client_id": "",
                "client_secret": ""
            }
        }


class SlackUserSchema(BaseModel):
    """Schema for Slack user data."""
    id: str = Field(..., description="Slack user ID")
    name: str = Field(..., description="Slack username")
    real_name: Optional[str] = Field(None, description="User's real name")
    email: Optional[str] = Field(None, description="User's email address")
    title: Optional[str] = Field(None, description="User's job title")
    is_admin: bool = Field(False, description="Whether the user is a workspace admin")


class SlackMessageSchema(BaseModel):
    """Schema for Slack message data."""
    id: str = Field(..., description="Message timestamp ID")
    text: str = Field(..., description="Message text content")
    user: str = Field(..., description="User ID who sent the message")
    timestamp: datetime = Field(..., description="Message timestamp")
    reactions: List[Dict[str, Any]] = Field(default_factory=list, description="Message reactions")
    replies: List["SlackMessageSchema"] = Field(default_factory=list, description="Thread replies")
    thread_ts: Optional[str] = Field(None, description="Parent thread timestamp if in a thread")
    attachments: List[Dict[str, Any]] = Field(default_factory=list, description="Message attachments")


class SlackChannelSchema(BaseModel):
    """Schema for Slack channel data."""
    id: str = Field(..., description="Channel ID")
    name: str = Field(..., description="Channel name")
    is_private: bool = Field(False, description="Whether the channel is private")
    created: datetime = Field(..., description="Channel creation time")
    creator: Optional[str] = Field(None, description="User ID of channel creator")
    messages: List[SlackMessageSchema] = Field(default_factory=list, description="Channel messages")


class SlackCanvasSchema(BaseModel):
    """Schema for Slack canvas data."""
    id: str = Field(..., description="Canvas ID")
    title: str = Field(..., description="Canvas title")
    created: datetime = Field(..., description="Canvas creation time")
    creator: str = Field(..., description="User ID of canvas creator")
    content: List[Dict[str, Any]] = Field(default_factory=list, description="Canvas content blocks")
    channel_id: Optional[str] = Field(None, description="ID of associated channel")


class SlackWorkspaceSchema(BaseModel):
    """Schema for comprehensive Slack workspace data."""
    id: str = Field(..., description="Workspace ID")
    name: str = Field(..., description="Workspace name")
    domain: str = Field(..., description="Workspace domain")
    users: List[SlackUserSchema] = Field(default_factory=list, description="Workspace users")
    channels: List[SlackChannelSchema] = Field(default_factory=list, description="Workspace channels")
    canvases: List[SlackCanvasSchema] = Field(default_factory=list, description="Workspace canvases")
    extraction_time: datetime = Field(..., description="When the data was extracted")


class SlackAIProcessingRequestSchema(BaseModel):
    """Schema for requesting AI processing of Slack data."""
    workspace_id: str = Field(..., description="ID of the workspace to process")
    process_channels: List[str] = Field(default_factory=list, description="List of channel IDs to process (empty for all)")
    process_canvases: bool = Field(True, description="Whether to process canvas data")
    max_message_age_days: Optional[int] = Field(None, description="Maximum age of messages to process in days")
    instruction: Optional[str] = Field(None, description="Custom instructions for the AI processor")


class SlackAIProcessingResultSchema(BaseModel):
    """Schema for AI processing results of Slack data."""
    workspace_id: str = Field(..., description="ID of the processed workspace")
    summary: str = Field(..., description="Overall summary of the workspace")
    channel_summaries: Dict[str, str] = Field(default_factory=dict, description="Summaries for each channel")
    canvas_summaries: Dict[str, str] = Field(default_factory=dict, description="Summaries for each canvas")
    key_insights: List[str] = Field(default_factory=list, description="Key insights extracted")
    topics: List[Dict[str, Any]] = Field(default_factory=list, description="Topics identified across the workspace")
    processing_time: datetime = Field(..., description="When the processing was completed")


# Update forward references for nested models
SlackMessageSchema.update_forward_refs()
