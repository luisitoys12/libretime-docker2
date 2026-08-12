# LibreTime Docker - EstacionKusmedios

Configuración Docker de LibreTime para radio automatizada con streaming en bunny.net Edge.

## URLs de Acceso

| Servicio | URL | Notas |
|----------|-----|-------|
| Stream MP3 | https://libretime-afgbp.bunny.run/live.mp3 | bunny.net Edge Script |
| Stream OGG | https://libretime-afgbp.bunny.run/live | bunny.net Edge Script |
| Stream Mobile | https://libretime-afgbp.bunny.run/mobile.mp3 | 96kbps MP3 |
| Health Check | https://libretime-afgbp.bunny.run/status | JSON status endpoint |
| Panel Admin | ngrok HTTP (ver abajo) | URL dinámica via ngrok |

## Instalación

### Prerequisitos
- Docker + Docker Compose
- ngrok (instalar: `npm install -g ngrok` o descargar de [ngrok.com](https://ngrok.com))
- Cuenta en [bunny.net](https://bunny.net) con Edge Scripting habilitado
- Cuenta en GitHub para GitHub Actions

### Clonar e iniciar
```bash
git clone https://github.com/luisitoys12/libretime-docker2.git
cd libretime-docker2

# Iniciar todos los servicios
docker compose up -d

# Ejecutar migraciones (primera vez)
docker compose exec api libretime-api migrate

# Crear usuario admin (opcional - ya existe admin/AdminLibreTime2026!)
docker exec -i libretime-docker2-api-1 python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'libretime_api.settings.prod')
os.environ.setdefault('LIBRETIME_CONFIG_FILEPATH', '/etc/libretime/config.yml')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('admin', 'admin@estacionkusmedios.org', 'AdminLibreTime2026!')
print('Admin creado')
"
```

## Acceso al Panel

### Opción 1: ngrok (recomendado para desarrollo)
```bash
# Iniciar todos los túneles
ngrok start --config ngrok.yml radio-panel radio-stream radio-input-main radio-input-show

# Acceder al panel (URL generada por ngrok)
# Ejemplo: https://xxxxx.ngrok-free.dev
```

### Opción 2: Cloudflare Tunnel (producción con dominio propio)
1. Configurar `cloudflared-config.yml` con tu dominio
2. Colocar `cloudflared-credentials.json` en el root
3. Incluir el servicio `cloudflared` en docker-compose

**Credenciales admin:**
- Usuario: `admin`
- Password: `AdminLibreTime2026!`
- Email: `admin@estacionkusmedios.org`

## Streaming (bunny.net Edge Script)

### Arquitectura
```
Usuario → bunny.net Edge Script → ngrok → Nginx (8080) → Icecast (8000)
```

El Edge Script (`script.ts`) es un **standalone script** que:
1. Recibe requests en `https://libretime-afgbp.bunny.run/`
2. Proxya al Icecast origin via `ICECAST_ORIGIN` env var
3. Añade headers CORS para permitir embedding en web
4. Sirve un endpoint `/status` para health checks

### Configuración en bunny.net
1. Ir a [dashboard.bunny.net](https://dash.bunny.net) → Edge Platform → Scripting
2. El script `script.ts` ya está conectado vía GitHub Integration
3. En **Environment Variables**, agregar:
   - `name`: `ICECAST_ORIGIN`
   - `value`: `https://xxxxx.ngrok-free.dev` (URL de ngrok para Icecast)
4. Guardar y publicar

### Deploy automático
El workflow `.github/workflows/deploy-script.yml` despliega automaticamente al hacer push a `main`:
```bash
git add .
git commit -m "mensaje"
git push origin main
```

## Añadir Música

### Archivos demo ya incluidos
3 pistas royalty-free en `/srv/libretime/media/music/imports/`:
- `Cafe_BGM.mp3` - Música de fondo relajada
- `Chill_Vibes.mp3` - Vibes relajadas
- `Acoustic_Sunset.mp3` - Acústico al atardecer

### Añadir más música
```bash
# Copiar archivos al contenedor (desde el host)
docker compose cp archivo.mp3 analyzer:/srv/libretime/media/music/imports/

# O montar un directorio local
# En docker-compose.yml, agregar al volumen analyzer:
#   - ./music:/srv/libretime/media/music:rw
```

Luego en el panel: **Agregar Medios** → **Importar** → seleccionar archivos de la biblioteca.

## AutoDJ (Auto DJ)

1. **Importar música** (como arriba)
2. **Crear playlist**: Sidebar → Listas de Reproducción → Nueva
3. **Configurar Smart Block para AutoDJ**:
   - Sidebar → Smart Blocks → Nuevo
   - Nombre: "Auto DJ"
   - Arrastra la playlist demo
4. **Programar**:
   - Sidebar → Calendario → Crear Show
   - Seleccionar "Auto DJ" como contenido
   - Programar para las 24h

## Configuración de Software de Radio

Para transmitir desde RadioBoss, VirtualDJ, BUTT o Mixxx:

| Campo | Valor |
|-------|-------|
| Servidor | URL TCP de ngrok (ej: `0.tcp.us-cal-1.ngrok.io`) |
| Puerto | Puerto TCP de ngrok (ej: `15721`) |
| Mount | `/main` o `/show` |
| Usuario | `source` |
| Password | `KusRadio2026!` |
| Formato | Icecast2 |

Ver los puertos TCP exactos:
```bash
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

## Túneles ngrok

Configurados en `ngrok.yml`:

| Nombre | Proto | Addr | Uso |
|--------|-------|------|-----|
| `radio-stream` | HTTP | 8000 | Icecast (origin para bunny.net) |
| `radio-panel` | HTTP | 8080 | Panel LibreTime |
| `radio-input-main` | TCP | 8001 | Entrada principal radio |
| `radio-input-show` | TCP | 8002 | Entrada show en vivo |

## Troubleshooting

### Panel muestra "Oops! Something went wrong!"
- Verifica que `public_url` en `config.yml` coincida con la URL de acceso
- Reinicia: `docker compose restart legacy api`

### Stream no carga
- Verifica que ngrok esté corriendo: `curl http://localhost:4040/api/tunnels`
- Verifica que Icecast responda: `curl -I http://localhost:8000/live.mp3`
- Configura `ICECAST_ORIGIN` en bunny.net dashboard

### Crear usuario admin
```bash
docker exec -i libretime-docker2-api-1 python -c "
import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'libretime_api.settings.prod')
os.environ.setdefault('LIBRETIME_CONFIG_FILEPATH', '/etc/libretime/config.yml')
import django; django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('admin', 'admin@estacionkusmedios.org', 'AdminLibreTime2026!')
"
```

---
Potenciado por [EstacionKusmedios](https://estacionkusmedios.org) | [LibreTime](https://libretime.org) | [bunny.net](https://bunny.net)
