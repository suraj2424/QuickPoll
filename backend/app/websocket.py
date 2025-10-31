from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.poll_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, poll_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if poll_id:
            if poll_id not in self.poll_connections:
                self.poll_connections[poll_id] = []
            self.poll_connections[poll_id].append(websocket)

    def disconnect(self, websocket: WebSocket, poll_id: int = None):
        self.active_connections.remove(websocket)
        
        if poll_id and poll_id in self.poll_connections:
            if websocket in self.poll_connections[poll_id]:
                self.poll_connections[poll_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_poll(self, message: dict, poll_id: int, payload: dict = None):
        if poll_id in self.poll_connections:
            for connection in self.poll_connections[poll_id]:
                try:
                    if payload:
                        await connection.send_text(json.dumps({"message": message, "payload": payload}))
                    else:
                        await connection.send_text(json.dumps(message))
                except:
                    # Remove broken connections
                    self.poll_connections[poll_id].remove(connection)

    async def broadcast_all(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                # Remove broken connections
                self.active_connections.remove(connection)

    async def broadcast_heartbeat(self):
        await self.broadcast_all({"type": "heartbeat"})

    async def broadcast_heartbeat_to_poll(self, poll_id: int):
        if poll_id in self.poll_connections:
            for connection in self.poll_connections[poll_id]:
                try:
                    await connection.send_text(json.dumps({"type": "heartbeat"}))
                except:
                    # Remove broken connections
                    self.poll_connections[poll_id].remove(connection)

manager = ConnectionManager()