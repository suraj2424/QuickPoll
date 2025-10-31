"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE_URL } from "@/lib/config";

interface UseWebSocketOptions {
  path?: string;
  onMessage?: (event: MessageEvent<string>) => void;
  shouldReconnect?: boolean;
  reconnectIntervalMs?: number;
}

export function useWebSocket({
  path = "/ws",
  onMessage,
  shouldReconnect = true,
  reconnectIntervalMs = 2000,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  useEffect(() => {
    function connect() {
      const url = `${WS_BASE_URL}${path}`;
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        setReadyState(socket.readyState);
      };

      socket.onmessage = (event) => {
        onMessage?.(event);
      };

      socket.onclose = () => {
        setReadyState(socket.readyState);
        if (shouldReconnect) {
          reconnectTimeoutRef.current = setTimeout(connect, reconnectIntervalMs);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      const socket = wsRef.current;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
      setReadyState(WebSocket.CLOSED);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onMessage, path, reconnectIntervalMs, shouldReconnect]);

  const sendMessage = useCallback((data: string | object) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    socket.send(payload);
  }, []);

  return {
    readyState,
    sendMessage,
  };
}
