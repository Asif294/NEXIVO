# Nexivo

Full-stack web application with a **Django REST Framework** backend and a **Next.js** frontend, containerized for a one-command dev environment.

---

## Tech stack

| Layer     | Technology                                                                 |
|-----------|----------------------------------------------------------------------------|
| Backend   | Python 3.12, Django 5.2, Django REST Framework, SimpleJWT, drf-yasg (Swagger), Daphne (ASGI) |
| Frontend  | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4   |
| Database  | SQLite (dev)                                                               |
| Tooling   | Docker + Docker Compose                                                    |

---

## Project structure

```
Nexivo/
├── backend/                 # Django project
│   ├── account/             # User auth (register, login, logout, JWT refresh)
│   ├── common/              # Shared base models & enums
│   ├── nexivo/              # Django settings, root URLs, ASGI/WSGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/nexivo/         # Next.js app (App Router under src/app)
├── docker/
│   ├── dev/                 # Dev compose stack + Dockerfiles
│   └── prod/                # Production setup (TBD)
└── README.md
```

---

## Quick start (Docker — recommended)

Requires Docker Engine + Docker Compose v2.

```bash
cd docker/dev
docker compose up --build
```

Then open:

| Service  | URL                                 |
|----------|-------------------------------------|
| Frontend | http://localhost:3000               |
| Backend  | http://localhost:8000               |
| Swagger  | http://localhost:8000/docs/swagger/ |
| ReDoc    | http://localhost:8000/docs/redoc/   |
| Admin    | http://localhost:8000/admin/        |

The backend applies migrations on startup and runs an auto-reloading server; both
containers bind-mount the source, so edits reload live. See
[`docker/README.md`](docker/README.md) for the full command reference (build, logs,
exec, teardown).

Stop the stack:

```bash
docker compose down
```

---

## Manual setup (without Docker)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin
python manage.py runserver          # http://localhost:8000
```

### Frontend

```bash
cd frontend/nexivo
npm install
npm run dev                          # http://localhost:3000
```

---

## API

Base path: `/api/`. Authentication uses **JWT** (SimpleJWT), with the refresh token
delivered via an HttpOnly cookie.

### Account (`/api/account/`)

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| POST   | `/register/`      | Register a new user                  |
| POST   | `/login/`         | Log in, returns access token         |
| POST   | `/logout/`        | Log out (blacklists refresh token)   |
| POST   | `/token/refresh/` | Refresh the access token (cookie)    |

Interactive docs are available at `/docs/swagger/` when `DEBUG=True`.

### User model

Custom user (`account.User`) with:
- Login identifier: `username` (email required)
- Roles: `customer` (default), `admin`
- Fields: `email`, `phone_number`, `full_name`, `profile_picture`, `date_of_birth`,
  `address` (JSON), plus verification/status flags

---

## Configuration

The backend reads these environment variables (set by the dev compose file):

| Variable                | Default                          | Purpose                          |
|-------------------------|----------------------------------|----------------------------------|
| `DJANGO_DEBUG`          | `True`                           | Toggle debug mode & Swagger      |
| `DJANGO_ALLOWED_HOSTS`  | `localhost,127.0.0.1,0.0.0.0`    | Comma-separated allowed hosts    |

The frontend reads:

| Variable               | Default                   | Purpose                    |
|------------------------|---------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000`   | Backend base URL (browser) |

> **Note:** the default `SECRET_KEY` in `settings.py` is a development key. Set a
> secure secret before any production deployment.
