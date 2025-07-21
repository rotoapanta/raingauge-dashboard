"""
auth_utils.py

Utilidades de autenticación para el backend de Raingauge Dashboard.
Incluye función para obtener el usuario actual a partir del JWT.
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
    Obtiene el usuario actual a partir del token JWT proporcionado en la cabecera Authorization.

    Args:
        credentials (HTTPAuthorizationCredentials): Credenciales de autorización HTTP Bearer.

    Returns:
        Optional[str]: Nombre de usuario extraído del token JWT.

    Raises:
        HTTPException: Si el token es inválido o ha expirado.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
