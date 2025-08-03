"""
auth_utils.py

Authentication utilities for the Raspberry Pi Dashboard backend.
Provides a function to retrieve the current user from a JWT token.

Utilidades de autenticación para el backend de Raspberry Pi Dashboard.
Proporciona una función para obtener el usuario actual a partir de un token JWT.
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
    Obtiene el usuario actual a partir del token JWT proporcionado en la cabecera Authorization.

    Args:
        credentials (HTTPAuthorizationCredentials): HTTP Bearer authorization credentials.
        credentials (HTTPAuthorizationCredentials): Credenciales de autorización HTTP Bearer.

    Returns:
        Optional[str]: Username extracted from the JWT token.
        Optional[str]: Nombre de usuario extraído del token JWT.

    Raises:
        HTTPException: If the token is invalid or expired.
        HTTPException: Si el token es inválido o ha expirado.
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
