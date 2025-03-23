"""
Slack Integration API Routes
Endpoints for Slack workspace data extraction and processing.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any

from ...models.slack import (
    SlackCredentialsSchema,
    SlackWorkspaceSchema,
    SlackAIProcessingRequestSchema,
    SlackAIProcessingResultSchema
)
from ...services.slack_integration import SlackIntegrationService
from ...services.ai_processor import AIProcessorService
from ...core.errors import IntegrationError
from ..deps import get_current_user, get_slack_service, get_ai_processor

router = APIRouter(prefix="/slack", tags=["slack"])


@router.post("/connect", status_code=201)
async def connect_slack_workspace(
    credentials: SlackCredentialsSchema,
    slack_service: SlackIntegrationService = Depends(get_slack_service),
    current_user = Depends(get_current_user)
):
    """
    Connect to a Slack workspace using provided credentials.
    
    This endpoint:
    1. Validates the Slack credentials
    2. Registers the workspace with the service
    3. Returns the workspace ID for future reference
    """
    try:
        workspace_id = slack_service.register_workspace(credentials)
        return {"workspace_id": workspace_id, "message": "Successfully connected to Slack workspace"}
    except IntegrationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/workspaces", response_model=List[Dict[str, str]])
async def list_connected_workspaces(
    slack_service: SlackIntegrationService = Depends(get_slack_service),
    current_user = Depends(get_current_user)
):
    """List all connected Slack workspaces for the current user."""
    try:
        # Get the list of registered workspace IDs
        workspaces = [{"id": workspace_id} for workspace_id in slack_service.clients.keys()]
        return workspaces
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list workspaces: {str(e)}")


@router.post("/extract", response_model=SlackWorkspaceSchema)
async def extract_workspace_data(
    workspace_id: str,
    background_tasks: BackgroundTasks,
    slack_service: SlackIntegrationService = Depends(get_slack_service),
    current_user = Depends(get_current_user)
):
    """
    Extract all data from a connected Slack workspace.
    
    This endpoint:
    1. Fetches users, channels, messages, and canvases from the workspace
    2. Optionally starts background processing with AI
    3. Returns the extracted data
    """
    try:
        # Start data extraction (this may take time for large workspaces)
        workspace_data = slack_service.fetch_all_workspace_data(workspace_id)
        return workspace_data
    except IntegrationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract workspace data: {str(e)}")


@router.post("/process", response_model=Dict[str, Any])
async def process_workspace_data(
    request: SlackAIProcessingRequestSchema,
    background_tasks: BackgroundTasks,
    slack_service: SlackIntegrationService = Depends(get_slack_service),
    ai_processor: AIProcessorService = Depends(get_ai_processor),
    current_user = Depends(get_current_user)
):
    """
    Process extracted Slack data with AI.
    
    This endpoint:
    1. Takes a workspace ID and processing parameters
    2. Fetches the workspace data if not already cached
    3. Starts an async background task for AI processing
    4. Returns a task ID for tracking progress
    """
    try:
        # First check if the workspace is connected
        if request.workspace_id not in slack_service.clients:
            raise HTTPException(status_code=404, detail=f"Workspace {request.workspace_id} not found")
        
        # Start asynchronous processing task
        task_id = ai_processor.start_processing_task(
            workspace_id=request.workspace_id,
            channels=request.process_channels,
            include_canvases=request.process_canvases,
            max_age_days=request.max_message_age_days,
            custom_instruction=request.instruction
        )
        
        return {
            "task_id": task_id,
            "status": "processing",
            "message": "AI processing started in the background"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start processing: {str(e)}")


@router.get("/process/{task_id}", response_model=Dict[str, Any])
async def get_processing_status(
    task_id: str,
    ai_processor: AIProcessorService = Depends(get_ai_processor),
    current_user = Depends(get_current_user)
):
    """Check the status of an ongoing AI processing task."""
    try:
        status = ai_processor.get_task_status(task_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task status: {str(e)}")


@router.get("/results/{task_id}", response_model=SlackAIProcessingResultSchema)
async def get_processing_results(
    task_id: str,
    ai_processor: AIProcessorService = Depends(get_ai_processor),
    current_user = Depends(get_current_user)
):
    """Get the results of a completed AI processing task."""
    try:
        # Check if the task is completed
        status = ai_processor.get_task_status(task_id)
        if status["status"] != "completed":
            raise HTTPException(status_code=400, detail=f"Task not completed yet: {status['status']}")
        
        # Get the results
        results = ai_processor.get_task_results(task_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task results: {str(e)}")
