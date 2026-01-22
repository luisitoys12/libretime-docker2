# LibreTime Docker - EstacionKusmedios

Configuración Docker de LibreTime para radio automatizada.

## URLs

| Servicio | URL |
|----------|-----|
| Panel Admin | https://time.kusmedios.lat |
| Documentación | https://docs.kusmedios.lat |
| Stream OGG | https://stream.kusmedios.lat/live |
| Stream MP3 | https://stream.kusmedios.lat/live.mp3 |

## Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/luisitoys12/libretime-docker2.git
cd libretime-docker2

# Configurar credenciales de Cloudflare
cp cloudflared-credentials.json.example cloudflared-credentials.json
# Editar con tus credenciales

# Iniciar servicios
docker compose up -d

# Ejecutar migraciones (primera vez)
docker compose exec api libretime-api migrate
```

## Servicios

- **LibreTime**: Panel de administración de radio
- **Icecast**: Servidor de streaming
- **Liquidsoap**: Motor de playout
- **PostgreSQL**: Base de datos
- **RabbitMQ**: Cola de mensajes
- **Cloudflared**: Túnel Cloudflare
- **Nginx Docs**: Documentación

## Conexión para Software de Radio

Para transmitir desde RadioBoss, VirtualDJ, BUTT o Mixxx:

- **Mount**: /main o /show
- **Usuario**: source
- **Formato**: Icecast2

## Estructura

```
├── docker-compose.yml      # Servicios Docker
├── config.yml              # Configuración LibreTime
├── cloudflared-config.yml  # Configuración túnel
├── docs/                   # Documentación web
│   └── index.html
└── ngrok.yml               # Configuración ngrok (opcional)
```

## Comandos Útiles

```bash
# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar servicio
docker compose restart <servicio>

# Detener todo
docker compose down
```

---
Potenciado por [EstacionKusmedios](https://estacionkusmedios.org)
