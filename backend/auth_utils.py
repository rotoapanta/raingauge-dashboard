"""
auth_utils.py

Authentication utilities for the Raingauge Dashboard backend.
Provides a function to retrieve the current user from a JWT token.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from typing import Optional

JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretjwtkey")
JWT_ALGORITHM = "HS256"

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Optional[str]:
    """
    Retrieve the current user from the JWT token provided in the Authorization header.

    Args:
        credentials (HTTPAuthorizationCredentials): HTTP Bearer authorization credentials.

    Returns:
        Optional[str]: Username extracted from the JWT token.

    Raises:
        HTTPException: If the token is invalid or expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
