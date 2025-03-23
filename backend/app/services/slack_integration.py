"""
Slack Integration Service
This module handles the integration with Slack API to fetch and process workspace data.
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv

from ..models.slack import (
    SlackChannelSchema,
    SlackMessageSchema, 
    SlackUserSchema,
    SlackCanvasSchema,
    SlackWorkspaceSchema,
    SlackCredentialsSchema
)
from ..core.errors import IntegrationError

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class SlackIntegrationService:
    """Service for interacting with Slack API to fetch workspace data."""
    
    def __init__(self):
        self.clients: Dict[str, WebClient] = {}
        
        # If default credentials are provided in environment, initialize a default client
        default_bot_token = os.environ.get("SLACK_BOT_TOKEN")
        if default_bot_token:
            try:
                default_credentials = SlackCredentialsSchema(
                    bot_token=default_bot_token,
                    app_token=os.environ.get("SLACK_APP_TOKEN"),
                    signing_secret=os.environ.get("SLACK_SIGNING_SECRET"),
                    client_id=os.environ.get("SLACK_CLIENT_ID"),
                    client_secret=os.environ.get("SLACK_CLIENT_SECRET")
                )
                self.register_workspace(default_credentials)
                logger.info("Initialized default Slack client from environment variables")
            except Exception as e:
                logger.warning(f"Failed to initialize default Slack client: {e}")
        
    def register_workspace(self, credentials: SlackCredentialsSchema) -> str:
        """
        Register a new Slack workspace with provided credentials.
        
        Args:
            credentials: Slack API credentials
            
        Returns:
            workspace_id: Unique identifier for the registered workspace
            
        Raises:
            IntegrationError: If connection to Slack API fails
        """
        try:
            client = WebClient(token=credentials.bot_token)
            # Test the connection
            auth_test = client.auth_test()
            workspace_id = auth_test["team_id"]
            
            self.clients[workspace_id] = client
            return workspace_id
        except SlackApiError as e:
            logger.error(f"Failed to connect to Slack API: {e}")
            raise IntegrationError(f"Failed to connect to Slack API: {e.response['error']}")
    
    def fetch_all_workspace_data(self, workspace_id: str) -> SlackWorkspaceSchema:
        """
        Fetch all data from a Slack workspace including channels, messages, users, and canvases.
        
        Args:
            workspace_id: ID of the workspace to fetch data from
            
        Returns:
            A comprehensive schema containing all workspace data
            
        Raises:
            IntegrationError: If data fetching fails
        """
        if workspace_id not in self.clients:
            raise IntegrationError(f"Workspace {workspace_id} not registered")
        
        client = self.clients[workspace_id]
        
        try:
            # Get basic workspace info
            workspace_info = client.team_info(team=workspace_id)
            
            # Fetch users
            users = self.fetch_users(client)
            
            # Fetch channels
            channels = self.fetch_channels(client)
            
            # Fetch messages for each channel
            for channel in channels:
                channel.messages = self.fetch_messages(client, channel.id)
            
            # Fetch canvases if available (Enterprise Grid feature)
            canvases = self.fetch_canvases(client)
            
            # Create workspace schema
            return SlackWorkspaceSchema(
                id=workspace_id,
                name=workspace_info["team"]["name"],
                domain=workspace_info["team"]["domain"],
                users=users,
                channels=channels,
                canvases=canvases,
                extraction_time=datetime.now()
            )
        except SlackApiError as e:
            logger.error(f"Failed to fetch workspace data: {e}")
            raise IntegrationError(f"Failed to fetch Slack workspace data: {e.response['error']}")
    
    def fetch_users(self, client: WebClient) -> List[SlackUserSchema]:
        """Fetch all users in the workspace."""
        users = []
        try:
            response = client.users_list()
            for member in response["members"]:
                # Skip bots and deleted users
                if member.get("is_bot", False) or member.get("deleted", False):
                    continue
                    
                users.append(SlackUserSchema(
                    id=member["id"],
                    name=member["name"],
                    real_name=member.get("real_name", ""),
                    email=member.get("profile", {}).get("email", ""),
                    title=member.get("profile", {}).get("title", ""),
                    is_admin=member.get("is_admin", False)
                ))
            return users
        except SlackApiError as e:
            logger.error(f"Failed to fetch users: {e}")
            raise IntegrationError(f"Failed to fetch Slack users: {e.response['error']}")
    
    def fetch_channels(self, client: WebClient) -> List[SlackChannelSchema]:
        """Fetch all channels in the workspace."""
        channels = []
        try:
            # Get public channels
            response = client.conversations_list(types="public_channel")
            
            for channel in response["channels"]:
                channels.append(SlackChannelSchema(
                    id=channel["id"],
                    name=channel["name"],
                    is_private=channel["is_private"],
                    created=datetime.fromtimestamp(float(channel["created"])),
                    creator=channel.get("creator", ""),
                    messages=[]  # Will be populated later
                ))
            
            # Get private channels if access is available
            try:
                response = client.conversations_list(types="private_channel")
                for channel in response["channels"]:
                    channels.append(SlackChannelSchema(
                        id=channel["id"],
                        name=channel["name"],
                        is_private=channel["is_private"],
                        created=datetime.fromtimestamp(float(channel["created"])),
                        creator=channel.get("creator", ""),
                        messages=[]  # Will be populated later
                    ))
            except SlackApiError:
                # Might not have access to private channels
                logger.warning("Could not access private channels")
                
            return channels
        except SlackApiError as e:
            logger.error(f"Failed to fetch channels: {e}")
            raise IntegrationError(f"Failed to fetch Slack channels: {e.response['error']}")
    
    def fetch_messages(self, client: WebClient, channel_id: str, limit: int = 1000) -> List[SlackMessageSchema]:
        """Fetch messages from a specific channel."""
        messages = []
        try:
            response = client.conversations_history(channel=channel_id, limit=limit)
            
            for msg in response["messages"]:
                if "subtype" in msg and msg["subtype"] in ["channel_join", "channel_leave"]:
                    continue  # Skip join/leave messages
                    
                # Handle thread replies if any
                thread_replies = []
                if msg.get("thread_ts") and msg.get("reply_count", 0) > 0:
                    thread = client.conversations_replies(
                        channel=channel_id,
                        ts=msg["thread_ts"]
                    )
                    # Skip the parent message which is already included
                    for reply in thread["messages"][1:]:  
                        thread_replies.append(SlackMessageSchema(
                            id=reply["ts"],
                            text=reply["text"],
                            user=reply.get("user", ""),
                            timestamp=datetime.fromtimestamp(float(reply["ts"])),
                            reactions=[],
                            thread_ts=reply.get("thread_ts", ""),
                            attachments=self._process_attachments(reply)
                        ))
                
                # Process reactions
                reactions = []
                if "reactions" in msg:
                    for reaction in msg["reactions"]:
                        reactions.append({
                            "name": reaction["name"],
                            "count": reaction["count"],
                            "users": reaction.get("users", [])
                        })
                
                messages.append(SlackMessageSchema(
                    id=msg["ts"],
                    text=msg["text"],
                    user=msg.get("user", ""),
                    timestamp=datetime.fromtimestamp(float(msg["ts"])),
                    reactions=reactions,
                    replies=thread_replies,
                    thread_ts=msg.get("thread_ts", ""),
                    attachments=self._process_attachments(msg)
                ))
                
            return messages
        except SlackApiError as e:
            logger.error(f"Failed to fetch messages for channel {channel_id}: {e}")
            raise IntegrationError(f"Failed to fetch Slack messages: {e.response['error']}")
    
    def _process_attachments(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process and standardize message attachments."""
        if "attachments" not in message:
            return []
            
        processed = []
        for attachment in message["attachments"]:
            processed_attachment = {
                "type": attachment.get("type", "unknown"),
                "title": attachment.get("title", ""),
                "text": attachment.get("text", ""),
                "fallback": attachment.get("fallback", "")
            }
            
            # Add file details if present
            if "files" in message:
                for file in message["files"]:
                    processed_attachment["file"] = {
                        "name": file.get("name", ""),
                        "filetype": file.get("filetype", ""),
                        "size": file.get("size", 0),
                        "url_private": file.get("url_private", "")
                    }
            
            processed.append(processed_attachment)
            
        return processed
    
    def fetch_canvases(self, client: WebClient) -> List[SlackCanvasSchema]:
        """Fetch all canvases in the workspace if the API supports it."""
        canvases = []
        try:
            # Note: This is a premium feature that may require Enterprise Grid
            # and may not be available in all workspaces
            response = client.canvas_list()
            
            for canvas in response.get("canvases", []):
                canvas_info = client.canvas_get(canvas_id=canvas["id"])
                
                canvases.append(SlackCanvasSchema(
                    id=canvas["id"],
                    title=canvas["title"],
                    created=datetime.fromtimestamp(float(canvas["date_created"])),
                    creator=canvas["created_by"],
                    content=canvas_info.get("content", {}).get("blocks", []),
                    channel_id=canvas.get("channel_id", "")
                ))
                
            return canvases
        except SlackApiError as e:
            # This might fail if the workspace doesn't have Canvases feature
            logger.warning(f"Could not fetch canvases: {e}")
            return []
