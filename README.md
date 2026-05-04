# Sklep internetowy

Projekt można uruchomić lokalnie przy pomocy Docker Compose.

## Uruchomienie

1. W katalogu głównym projektu utwórz plik `.env` na podstawie `.env.example`.
2. Uruchom usługi:

```bash
docker compose up -d --build
```

## Seed danych

Po uruchomieniu usług wykonaj inicjalizację danych przykładowych: produktów oraz użytkowników.

```bash
docker compose --profile initializer run --rm db_initializer
```

## Dostęp

Aplikacja jest dostępna pod adresem:

```text
http://localhost:8081
```


## Wyłączenie

Wyłączenie usługi następuje po wywołaniu komendy:

```bash
docker compose down
```
