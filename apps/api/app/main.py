from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.v1 import calls, coach

app = FastAPI(
    title="SalesCoach AI API",
    version="0.1.0",
    description="AI-Powered Sales Coach API",
)


class ForceOptionsCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "*")

        if request.method == "OPTIONS":
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                    "Access-Control-Max-Age": "600",
                },
            )

        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


app.add_middleware(ForceOptionsCORSMiddleware)

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
