```markdown
# Sklep internetowy

Projekt zespołowy – sklep internetowy.

Trzy główne foldery:

- `backend` – REST API + Logika biznesowa
- `frontend` – Expo (web + mobile)
- `infra` – AWS CDK (IaC)


## Szybki start

### Co jest potrzebne do uruchomienia:
- plik .env ze zmiennymi środowiskowymi (patrz .env.example)
- Docker/Podman wraz z Docker Compose (uruchomienie backendu i frontendu przy użyciu jednej komendy)

```bash
cd projekt_zespolowyc
docker compose up -d  --build         # albo podman compose up -d --build
```

## .env (dev)

```env
AUTH_SETTINGS__PASSWORD_PEPPER=default_pepper_value
DB_SQL_SETTINGS__HOST=localhost
DB_SQL_SETTINGS__PORT=5432
DB_SQL_SETTINGS__USERNAME=postgres
DB_SQL_SETTINGS__PASSWORD=postgres
DB_SQL_SETTINGS__DATABASE=store_db
VECTOR_STORE_SETTINGS__CHROMA_HOST=localhost
VECTOR_STORE_SETTINGS__CHROMA_PORT=8001
VECTOR_STORE_SETTINGS__CHROMA_ANONYMIZED_TELEMETRY=false
PAYMENTS_SETTINGS__PROVIDER_URL=https://api.sandbox.paynow.pl/v1/payments
PAYMENTS_SETTINGS__API_KEY=API_KEY_OD_PROVIDERA
PAYMENTS_SETTINGS__SIGN_PHRASE=sign-phrase-od-providera
```

## Porty

- backend: 8000
- postgres: 5432
- chroma: 8001
````