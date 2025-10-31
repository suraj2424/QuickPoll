from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.routes.users import router as users_router
from app.routes.polls import router as polls_router
from app.routes.votes import router as votes_router
from app.routes.options import router as options_router
from app.routes.likes import router as likes_router
from app.websocket import manager


app = FastAPI(
    title="QuickPoll",
    description="Real-Time Opinion Polling Platform",
    version="0.0.1",
)

Base.metadata.create_all(bind=engine)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/auth", tags=["users"])
app.include_router(polls_router, prefix="/polls", tags=["polls"])
app.include_router(votes_router, prefix="/votes", tags=["votes"])
app.include_router(options_router, prefix="/options", tags=["options"])
app.include_router(likes_router, prefix="/likes", tags=["likes"])

@app.websocket("/ws/{poll_id}")
async def websocket_endpoint(websocket: WebSocket, poll_id: int):
    await manager.connect(websocket, poll_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - can be extended for chat features
            await manager.send_personal_message(f"Message: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)

@app.websocket("/ws")
async def websocket_general(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_all({"message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message" : "Welcome to QuickPoll this is root path"}