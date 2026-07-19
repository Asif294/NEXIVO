# Docker

Containerized dev stack for Nexivo: **Django/DRF backend** + **Next.js frontend** with live reload.

## Layoutreload.

## Layout

```
docker/
├── dev/
│   ├── docker-compose.yml     # dev stack (backend + frontend)
│   ├── Dockerfile.backend     # Python 3.12 image for Django
│   └── dockerfile.frontend    #
└── prod/                      # (empty — production setup TBD)
```

## Prerequisites

- Docker Engine + Docker Composehe old `docker-compose`)

## Quick start (dev)

Run all commands from the `docke

```bash
cd docker/dev
```

### Build the images

```bash
docker compose build
```

### Start the stack

```bash
docker compose up
```

Or build and start in one step:

```bash
docker compose up --build
```

Run detached (in the background):

```bash
docker compose up -d --build
```

### Stop the stack

```bash
# Ctrl+C if running in the foreground, then:
docker compose down
```

Remove volumes too (wipes the anonymous node_modules volume):

```bash
docker compose down -v
```

## Services

| Service  | URL                                 | Notes                           |
|----------|-------------------------------------|---------------------------------|
| Backend  | http://localhost:8000               | Django dev server, auto-reload  |
| Swagger  | http://localhost:8000/docs/swagger/ | API docs                        |
| Frontend | http://localhost:3000               | Next.js dev server, auto-reload |

- The backend applies migrations on startup, then runs the auto-reloading dev server.
- The frontend reaches the backend from the browser via`NEXT_PUBLIC_API_URL=http://localhost:8000`.
- Source is bind-mounted into both containers, so edits on the host reload live.

## Common commands

```bash
# Rebuild without cache (e.g. after changing requirements.txt / package.json)
docker compose build --no-cache

# Tail logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Open a shell inside a running container
docker compose exec backend sh
docker compose exec frontend sh

# Run a one-off Django management command
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py makemigrations

# Restart a single service
docker compose restart backend
```
