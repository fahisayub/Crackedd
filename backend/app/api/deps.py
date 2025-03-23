"""
API Dependencies
This module defines FastAPI dependencies for API routes.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from ..core.security import verify_password, ALGORITHM, SECRET_KEY
from ..db.session import get_db
from ..models.user import UserSchema
from ..services.slack_integration import SlackIntegrationService
from ..services.ai_processor import AIProcessorService

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Service instances (could be moved to a proper DI container in larger apps)
_slack_service = SlackIntegrationService()
_ai_processor = AIProcessorService(_slack_service)


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserSchema:
    """
    Verify the access token and return the authenticated user.
    
    Args:
        token: JWT access token
        
    Returns:
        The authenticated user
        
    Raises:
        HTTPException: If the token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # In a real implementation, you would fetch the user from the database
    # This is a simple placeholder
    user = UserSchema(id=user_id, email=payload.get("email", ""), is_active=True)
    
    if user is None:
        raise credentials_exception
    
    return user


def get_slack_service() -> SlackIntegrationService:
    """
    Get the Slack integration service instance.
    
    Returns:
        SlackIntegrationService: The service instance
    """
    return _slack_service


def get_ai_processor() -> AIProcessorService:
    """
    Get the AI processor service instance.
    
    Returns:
        AIProcessorService: The service instance
    """
    return _ai_processor
