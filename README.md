# LibreTime Docker - EstacionKusmedios

Configuración Docker de LibreTime para radio automatizada con streaming en bunny.net Edge.

## Estado Actual

| Servicio | URL | Estado |
|----------|-----|--------|
| Stream (Edge Script) | https://libretime-afgbp.bunny.run/live.mp3 | Activo en bunny.net |
| Stream OGG | https://libretime-afgbp.bunny.run/live | Activo en bunny.net |
| Stream Mobile | https://libretime-afgbp.bunny.run/mobile.mp3 | Activo en bunny.net |
| Panel Admin | ngrok (ver abajo) | Corriendo |
| Health Check | https://libretime-afgbp.bunny.run/status | Activo |

## Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/luisitoys12/libretime-docker2.git
cd libretime-docker2

# Iniciar servicios
docker compose up -d

# Ejecutar migraciones (primera vez)
docker compose exec api libretime-api migrate

# Crear usuario admin
docker compose exec api libretime-api createsuperuser
```

## Acceso

### Panel de Administración
El panel se expone via **ngrok**. Inicia el túnel:
```bash
ngrok start --config ngrok.yml radio-panel
```
Luego accede a la URL que ngrok genera (ej: `https://xxx.ngrok-free.dev`).

Credenciales admin: **admin** / **CambiaEsto123!** (cambia al primer login)

### Streaming
El streaming se sirve a través de **bunny.net Edge Scripting** en:
- MP3: https://libretime-afgbp.bunny.run/live.mp3
- OGG: https://libretime-afgbp.bunny.run/live
- Mobile: https://libretime-afgbp.bunny.run/mobile.mp3

## Música Demo

Ya hay 3 pistas demo cargadas en el almacenamiento:
- `Cafe_BGM.mp3` - Música de fondo relajada
- `Chill_Vibes.mp3` - Vibes relajadas
- `Acoustic_Sunset.mp3` - Acústico al atardecer

Para añadir más:
1. Copia archivos MP3 a: `./media/music/imports/` (o dentro del contenedor: `/srv/libretime/media/music/imports/`)
2. El analyzer los procesará automáticamente
3. Desde el panel, importa los archivos y crea playlists

## AutoDJ

El AutoDJ reproduce música automáticamente desde playlists programadas:

1. **Importar música**: En el panel → Agregar Medios → Importar desde archivos
2. **Crear playlist**: Sidebar → Listas de Reproducción → Nueva
3. **Programar AutoDJ**: 
   - Sidebar → Smart Blocks → Nuevo
   - Selecciona la playlist demo
   - Asigna al Show de AutoDJ

## GitHub Actions - Deploy Edge Script

El workflow `.github/workflows/deploy-script.yml` despliega automáticamente el script de bunny.net en cada push a `main`.

```bash
git add .
git commit -m "mensaje"
git push origin main
```

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| PostgreSQL | 5432 | Base de datos |
| RabbitMQ | 5672 | Cola de mensajes |
| Icecast | 8000 | Servidor de streaming |
| Liquidsoap | 8001/8002 | Motor de playout |
| Nginx | 8080 | Panel LibreTime |
| Analyzer | - | Procesamiento de audio |
| Docs | 80 | Documentación web |

## Túneles ngrok

Configurados en `ngrok.yml`:
- `radio-stream` (HTTP 8000) - Icecast para bunny.net origin
- `radio-panel` (HTTP 8080) - Panel de administración
- `radio-input-main` (TCP 8001) - Entrada principal para RadioBoss/VDJ
- `radio-input-show` (TCP 8002) - Entrada para shows en vivo

## Túneles Cloudflare (legacy)

El archivo `cloudflared-config.yml` configura túneles para:
- `time.kusmedios.lat` → Nginx (panel)
- `docs.kusmedios.lat` → Docs (documentación)
- `libretime-afgbp.bunny.run` → Icecast (streaming via bunny.net)

## Comandos Útiles

```bash
# Ver estado de servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar un servicio
docker compose restart icecast

# Detener todo
docker compose down

# Ver túneles ngrok activos
curl http://localhost:4040/api/tunnels
```

## Conexión para Software de Radio

Para transmitir desde RadioBoss, VirtualDJ, BUTT o Mixxx:

- **Mount**: /main o /show
- **Usuario**: source
- **Password**: KusRadio2026!
- **Formato**: Icecast2
- **Puerto**: TCP (consulta ngrok: `radio-input-main`)

---
Potenciado por [EstacionKusmedios](https://estacionkusmedios.org) | [LibreTime](https://libretime.org) | [bunny.net](https://bunny.net)
