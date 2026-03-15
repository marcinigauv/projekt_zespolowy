from fastapi import FastAPI

app = FastAPI()


@app.get('/healthcheck', response_model=bool)
async def get_healthcheck_response() -> bool:
    """Endpoint to get healh check status."""
    return True
