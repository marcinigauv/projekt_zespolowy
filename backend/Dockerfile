
FROM python:3.13-slim-bookworm

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        libpq5 \
        && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
           /usr/share/man/* /usr/share/doc/* \
           /root/.cache

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
RUN addgroup --system --gid 1000 app && \
    adduser --system --uid 1000 --gid 1000 --home /home/app app && \
    mkdir -p /home/app/.cache/huggingface /home/app/.cache/torch/sentence_transformers && \
    chown -R app:app /home/app

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project && \
    uv pip install --no-cache-dir gunicorn 

COPY --chown=app:app src/ ./src/

USER app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    HOME="/home/app" \
    XDG_CACHE_HOME="/home/app/.cache" \
    HF_HOME="/home/app/.cache/huggingface" \
    TRANSFORMERS_CACHE="/home/app/.cache/huggingface" \
    SENTENCE_TRANSFORMERS_HOME="/home/app/.cache/torch/sentence_transformers"


CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]