from ldap3 import Server, Connection, ALL, SIMPLE, SUBTREE

LDAP_SERVER = "ldap://srvbckup.igepn.edu.ec:50000"
LDAP_BASE_DN = "DC=igepn,DC=edu,DC=ec"
LDAP_SEARCH_ATTR = "sAMAccountName"
LDAP_BIND_DN = "rtoapanta@igepn.edu.ec"  # Usuario de servicio para bind y búsqueda
LDAP_BIND_PASSWORD = "TECNOLOGO"  # <--- PON AQUÍ LA CLAVE DEL USUARIO DE SERVICIO

username = "rtoapanta"  # Usuario a probar
password = ""  # <--- PON AQUÍ LA CLAVE DEL USUARIO A PROBAR

print(f"Conectando a {LDAP_SERVER} como {LDAP_BIND_DN}...")
server = Server(LDAP_SERVER, get_info=ALL)
try:
    # Bind con usuario de servicio
    conn = Connection(server, user=LDAP_BIND_DN, password=LDAP_BIND_PASSWORD, authentication=SIMPLE, auto_bind=True)
    print("Bind de servicio exitoso.")
    print(f"Buscando usuario {username} en {LDAP_BASE_DN} usando filtro ({LDAP_SEARCH_ATTR}={username})...")
    # Buscar el DN del usuario
    conn.search(
        search_base=LDAP_BASE_DN,
        search_filter=f'({LDAP_SEARCH_ATTR}={username})',
        search_scope=SUBTREE,
        attributes=["distinguishedName"]
    )
    if not conn.entries:
        print("Usuario no encontrado en AD")
        exit(1)
    user_dn = conn.entries[0].distinguishedName.value
    print(f"DN encontrado: {user_dn}")
    conn.unbind()
except Exception as e:
    print(f"Error buscando usuario en AD: {e}")
    exit(1)

# Intentar autenticación (bind) con el usuario y contraseña
try:
    print(f"Intentando autenticación con {user_dn} ...")
    user_conn = Connection(server, user=user_dn, password=password, authentication=SIMPLE, auto_bind=True)
    print("¡Autenticación exitosa!")
    user_conn.unbind()
except Exception as e:
    print(f"Credenciales inválidas o error de autenticación: {e}")