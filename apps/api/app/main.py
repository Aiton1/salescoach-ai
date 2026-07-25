from fastapi import FastAPI
from starlette.types import ASGIApp, Receive, Scope, Send
from app.api.v1 import calls, coach


class CORSMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_headers = dict(scope.get("headers", []))
        origin = request_headers.get(b"origin", b"").decode() or "*"
        method = scope.get("method", "GET")

        if method == "OPTIONS":
            response_headers = [
                (b"access-control-allow-origin", origin.encode()),
                (b"access-control-allow-credentials", b"true"),
                (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS, PATCH"),
                (b"access-control-allow-headers", b"Content-Type, Authorization, Accept"),
                (b"access-control-max-age", b"600"),
                (b"content-length", b"0"),
            ]

            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": response_headers,
            })
            await send({
                "type": "http.response.body",
                "body": b"",
            })
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", origin.encode()))
                headers.append((b"access-control-allow-credentials", b"true"))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)


app = FastAPI(
    title="SalesCoach AI API",
    version="0.1.0",
    description="AI-Powered Sales Coach API",
)

app.add_middleware(CORSMiddleware)

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
