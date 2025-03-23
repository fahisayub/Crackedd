"""
AI Processor Service
This module handles the processing of Slack data using AI for analysis and organization.
"""

import os
import logging
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

from ..models.slack import SlackWorkspaceSchema, SlackAIProcessingResultSchema
from ..core.errors import ProcessingError
from .slack_integration import SlackIntegrationService

logger = logging.getLogger(__name__)

class AIProcessorService:
    """Service for processing Slack data with AI to extract insights and organization."""
    
    def __init__(self, slack_service: SlackIntegrationService):
        """Initialize the AI processor service."""
        self.slack_service = slack_service
        self.processing_tasks = {}  # Store ongoing and completed tasks
        self.executor = ThreadPoolExecutor(max_workers=2)  # Limit concurrent processing
        
        # Initialize AI components
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY environment variable not set. AI processing won't work.")
        
        self.llm = ChatOpenAI(api_key=api_key, model_name="gpt-4", temperature=0)
        self.embeddings = OpenAIEmbeddings(api_key=api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=100
        )
    
    def start_processing_task(
        self, 
        workspace_id: str,
        channels: List[str] = None,
        include_canvases: bool = True,
        max_age_days: Optional[int] = None,
        custom_instruction: Optional[str] = None
    ) -> str:
        """
        Start an asynchronous task to process Slack data.
        
        Args:
            workspace_id: ID of the Slack workspace to process
            channels: Optional list of channel IDs to process (empty for all)
            include_canvases: Whether to include canvas data
            max_age_days: Maximum age of messages to process
            custom_instruction: Custom instructions for the AI processor
            
        Returns:
            task_id: Unique identifier for the task
        """
        task_id = str(uuid.uuid4())
        
        # Store task information
        self.processing_tasks[task_id] = {
            "workspace_id": workspace_id,
            "status": "queued",
            "started_at": datetime.now(),
            "completed_at": None,
            "parameters": {
                "channels": channels,
                "include_canvases": include_canvases,
                "max_age_days": max_age_days,
                "custom_instruction": custom_instruction
            },
            "results": None,
            "error": None
        }
        
        # Start processing in background
        self.executor.submit(
            self._process_workspace_data,
            task_id,
            workspace_id,
            channels,
            include_canvases,
            max_age_days,
            custom_instruction
        )
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get the status of a processing task."""
        if task_id not in self.processing_tasks:
            raise ProcessingError(f"Task {task_id} not found")
        
        task = self.processing_tasks[task_id]
        
        return {
            "task_id": task_id,
            "status": task["status"],
            "workspace_id": task["workspace_id"],
            "started_at": task["started_at"],
            "completed_at": task["completed_at"],
            "error": task["error"]
        }
    
    def get_task_results(self, task_id: str) -> SlackAIProcessingResultSchema:
        """Get the results of a completed processing task."""
        if task_id not in self.processing_tasks:
            raise ProcessingError(f"Task {task_id} not found")
        
        task = self.processing_tasks[task_id]
        
        if task["status"] != "completed":
            raise ProcessingError(f"Task {task_id} not completed yet")
        
        return task["results"]
    
    def _process_workspace_data(
        self,
        task_id: str,
        workspace_id: str,
        channels: List[str] = None,
        include_canvases: bool = True,
        max_age_days: Optional[int] = None,
        custom_instruction: Optional[str] = None
    ):
        """Process Slack workspace data (runs in background thread)."""
        try:
            # Update task status
            self.processing_tasks[task_id]["status"] = "processing"
            
            # Fetch workspace data if not already available
            workspace_data = self.slack_service.fetch_all_workspace_data(workspace_id)
            
            # Filter by channels if specified
            if channels:
                workspace_data.channels = [c for c in workspace_data.channels if c.id in channels]
            
            # Filter by message age if specified
            if max_age_days:
                cutoff_date = datetime.now() - timedelta(days=max_age_days)
                for channel in workspace_data.channels:
                    channel.messages = [
                        m for m in channel.messages 
                        if m.timestamp >= cutoff_date
                    ]
            
            # Process the data with AI
            # 1. Create a vector store from all messages
            documents = self._prepare_documents(workspace_data)
            if not documents:
                raise ProcessingError("No data to process after filtering")
            
            vector_store = self._create_vector_store(documents)
            
            # 2. Generate channel summaries
            channel_summaries = {}
            for channel in workspace_data.channels:
                if not channel.messages:
                    continue
                channel_summaries[channel.id] = self._generate_channel_summary(channel)
            
            # 3. Generate canvas summaries if included
            canvas_summaries = {}
            if include_canvases and workspace_data.canvases:
                for canvas in workspace_data.canvases:
                    canvas_summaries[canvas.id] = self._generate_canvas_summary(canvas)
            
            # 4. Extract key insights and topics
            overall_summary = self._generate_workspace_summary(
                workspace_data, 
                channel_summaries,
                canvas_summaries,
                custom_instruction
            )
            
            key_insights = self._extract_key_insights(
                workspace_data,
                overall_summary
            )
            
            topics = self._identify_topics(
                vector_store,
                workspace_data
            )
            
            # Create the result
            result = SlackAIProcessingResultSchema(
                workspace_id=workspace_id,
                summary=overall_summary,
                channel_summaries=channel_summaries,
                canvas_summaries=canvas_summaries,
                key_insights=key_insights,
                topics=topics,
                processing_time=datetime.now()
            )
            
            # Update task
            self.processing_tasks[task_id]["status"] = "completed"
            self.processing_tasks[task_id]["completed_at"] = datetime.now()
            self.processing_tasks[task_id]["results"] = result
        
        except Exception as e:
            logger.error(f"Error processing Slack data: {e}")
            self.processing_tasks[task_id]["status"] = "failed"
            self.processing_tasks[task_id]["error"] = str(e)
            self.processing_tasks[task_id]["completed_at"] = datetime.now()
    
    def _prepare_documents(self, workspace: SlackWorkspaceSchema) -> List[Document]:
        """Prepare documents from workspace data for embedding."""
        documents = []
        
        # Create a mapping of user IDs to names
        user_map = {user.id: user.real_name or user.name for user in workspace.users}
        
        # Process messages from each channel
        for channel in workspace.channels:
            for message in channel.messages:
                # Skip empty messages
                if not message.text.strip():
                    continue
                
                # Prepare metadata
                metadata = {
                    "channel_id": channel.id,
                    "channel_name": channel.name,
                    "message_id": message.id,
                    "user_id": message.user,
                    "user_name": user_map.get(message.user, "Unknown"),
                    "timestamp": message.timestamp.isoformat(),
                    "has_replies": len(message.replies) > 0,
                    "has_reactions": len(message.reactions) > 0,
                    "source_type": "message"
                }
                
                # Add the message as a document
                documents.append(Document(
                    page_content=message.text,
                    metadata=metadata
                ))
                
                # Add replies as separate documents
                for reply in message.replies:
                    reply_metadata = metadata.copy()
                    reply_metadata.update({
                        "message_id": reply.id,
                        "user_id": reply.user,
                        "user_name": user_map.get(reply.user, "Unknown"),
                        "timestamp": reply.timestamp.isoformat(),
                        "parent_message_id": message.id,
                        "source_type": "reply"
                    })
                    
                    documents.append(Document(
                        page_content=reply.text,
                        metadata=reply_metadata
                    ))
        
        # Process canvases
        for canvas in workspace.canvases:
            # Convert canvas content (blocks) to text
            # This is simplified and would need to be adapted based on actual canvas structure
            canvas_text = f"Canvas: {canvas.title}\n\n"
            for block in canvas.content:
                if "text" in block:
                    canvas_text += block["text"] + "\n"
                elif "rich_text" in block:
                    for element in block["rich_text"]:
                        if "text" in element:
                            canvas_text += element["text"] + "\n"
            
            metadata = {
                "canvas_id": canvas.id,
                "canvas_title": canvas.title,
                "channel_id": canvas.channel_id,
                "user_id": canvas.creator,
                "user_name": user_map.get(canvas.creator, "Unknown"),
                "timestamp": canvas.created.isoformat(),
                "source_type": "canvas"
            }
            
            documents.append(Document(
                page_content=canvas_text,
                metadata=metadata
            ))
        
        # Split documents if they're too long
        return self.text_splitter.split_documents(documents)
    
    def _create_vector_store(self, documents: List[Document]):
        """Create a vector store from documents."""
        return FAISS.from_documents(documents, self.embeddings)
    
    def _generate_channel_summary(self, channel):
        """Generate a summary for a channel."""
        if not channel.messages:
            return "Empty channel or no recent messages."
        
        # Prepare message text for summarization
        message_text = "\n".join([
            f"{msg.timestamp.strftime('%Y-%m-%d %H:%M')} - {msg.text}"
            for msg in channel.messages[:50]  # Limit to most recent messages
        ])
        
        # Create a summary chain
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant tasked with summarizing Slack channel conversations.
            
            Analyze the following messages from the Slack channel "{channel_name}" and provide a comprehensive summary that captures:
            1. Main topics discussed
            2. Key decisions or action items
            3. Overall mood or sentiment of the conversation
            4. Any unresolved questions or issues
            
            Keep the summary concise (3-5 paragraphs) but informative.
            
            MESSAGES:
            {message_text}
            
            SUMMARY:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        return chain.run(channel_name=channel.name, message_text=message_text)
    
    def _generate_canvas_summary(self, canvas):
        """Generate a summary for a canvas."""
        # Convert canvas content to text
        canvas_text = ""
        for block in canvas.content:
            if "text" in block:
                canvas_text += block["text"] + "\n"
            elif "rich_text" in block:
                for element in block["rich_text"]:
                    if "text" in element:
                        canvas_text += element["text"] + "\n"
        
        if not canvas_text.strip():
            return "Empty canvas or content could not be processed."
        
        # Create a summary chain
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant tasked with summarizing Slack canvas content.
            
            Analyze the following content from the Slack canvas "{canvas_title}" and provide a comprehensive summary that captures:
            1. Main topic or purpose of the canvas
            2. Key information, ideas or concepts presented
            3. Any decisions, action items or next steps
            
            Keep the summary concise (2-3 paragraphs) but informative.
            
            CANVAS CONTENT:
            {canvas_text}
            
            SUMMARY:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        return chain.run(canvas_title=canvas.title, canvas_text=canvas_text)
    
    def _generate_workspace_summary(
        self, 
        workspace, 
        channel_summaries, 
        canvas_summaries,
        custom_instruction
    ):
        """Generate an overall summary of the workspace."""
        # Combine channel summaries
        combined_summaries = "\n\n".join([
            f"CHANNEL: {workspace.channels[i].name}\nSUMMARY: {summary}"
            for i, (channel_id, summary) in enumerate(channel_summaries.items())
            if channel_id in [c.id for c in workspace.channels]
        ])
        
        # Add canvas summaries if available
        if canvas_summaries:
            combined_summaries += "\n\n" + "\n\n".join([
                f"CANVAS: {canvas.title}\nSUMMARY: {summary}"
                for canvas_id, summary in canvas_summaries.items()
                for canvas in workspace.canvases if canvas.id == canvas_id
            ])
        
        # Create custom instruction text
        instruction_text = ""
        if custom_instruction:
            instruction_text = f"""
            Additionally, the user has provided the following specific instructions for your analysis:
            {custom_instruction}
            Please incorporate these instructions into your summary and analysis.
            """
        
        # Create a summary chain
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant tasked with analyzing and summarizing an entire Slack workspace.
            
            Based on the following summaries of channels and canvases from the "{workspace_name}" Slack workspace, provide a comprehensive overview that:
            1. Identifies the main topics and themes across the workspace
            2. Highlights key projects or initiatives being discussed
            3. Notes any organizational patterns or team dynamics
            4. Identifies important decisions, action items, or unresolved issues
            
            {instruction_text}
            
            Keep the summary thorough but concise (around 500-700 words).
            
            CHANNEL AND CANVAS SUMMARIES:
            {combined_summaries}
            
            WORKSPACE SUMMARY:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        return chain.run(
            workspace_name=workspace.name,
            combined_summaries=combined_summaries,
            instruction_text=instruction_text
        )
    
    def _extract_key_insights(self, workspace, overall_summary):
        """Extract key insights from the workspace data and summary."""
        # Create an insights extraction chain
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant tasked with extracting key insights from Slack workspace data.
            
            Based on the following overall summary of the "{workspace_name}" Slack workspace, identify 5-10 key insights that would be valuable for someone trying to understand the workspace content and organization.
            
            Focus on:
            1. Important discoveries or realizations
            2. Hidden patterns or connections
            3. Critical business information
            4. Potential opportunities or challenges
            5. Decision drivers or rationales
            
            Format each insight as a clear, concise statement.
            
            WORKSPACE SUMMARY:
            {overall_summary}
            
            KEY INSIGHTS (output as a JSON array of strings):"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        insights_text = chain.run(
            workspace_name=workspace.name,
            overall_summary=overall_summary
        )
        
        # Parse the result as a list of strings
        # Note: This assumes the LLM follows instructions for JSON format
        # A robust implementation would need better error handling
        try:
            import json
            insights = json.loads(insights_text)
            if not isinstance(insights, list):
                insights = insights_text.strip().split("\n")
        except Exception:
            # Fallback to splitting by newlines if JSON parsing fails
            insights = insights_text.strip().split("\n")
            
        return insights
    
    def _identify_topics(self, vector_store, workspace):
        """Identify key topics across the workspace using clustering and LLM analysis."""
        # This is a simplified implementation
        # A more robust version would use clustering on embeddings
        
        # For now, we'll use the LLM to identify topics
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant tasked with identifying key topics across a Slack workspace.
            
            For the "{workspace_name}" Slack workspace, identify 5-10 main topics or themes that appear across channels and conversations.
            
            For each topic:
            1. Provide a clear, concise name
            2. Give a brief description
            3. List related keywords or terms
            
            Format your response as a JSON array of objects with "name", "description", and "keywords" fields.
            
            KEY TOPICS:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        topics_text = chain.run(workspace_name=workspace.name)
        
        # Parse the result as a list of objects
        try:
            import json
            topics = json.loads(topics_text)
            if not isinstance(topics, list):
                # Fallback to a basic structure
                topics = [{"name": "General", "description": "General discussion", "keywords": ["general"]}]
        except Exception:
            # Fallback to a basic structure
            topics = [{"name": "General", "description": "General discussion", "keywords": ["general"]}]
            
        return topics
