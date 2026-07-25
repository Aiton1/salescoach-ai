from fastapi import FastAPI, Request, Response
from app.api.v1 import calls, coach

app = FastAPI(
    title="SalesCoach AI API",
    version="0.1.0",
    description="AI-Powered Sales Coach API",
)


@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "*")

    if request.method == "OPTIONS":
        response = Response()
        response.status_code = 200
    else:
        response = await call_next(request)

    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "600"
    return response


app.include_router(calls.router, prefix="/api/v1", tags=["calls"])
app.include_router(coach.router, prefix="/api/v1/coach", tags=["coach"])


@app.get("/")
async def root():
    return {
        "name": "SalesCoach AI API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
