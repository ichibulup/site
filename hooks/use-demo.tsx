"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useDemo = () => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Create Socket.IO connection ONCE
    const socket = io("http://localhost:8080");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✓ Connected to Socket.IO server");
    });

    socket.on("message", (data) => {
      console.log("Server message:", data);
      setMessages(data);
    });

    socket.on("disconnect", () => {
      console.log("⨯ Socket disconnected");
    });

    // cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  function sendMessage(msg: string) {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      console.log("Sending:", msg);
      socket.emit("message", msg);      // EMIT to server
    } else {
      console.log("Waiting for socket to connect...");
      socket.once("connect", () => socket.emit("message", msg));
    }
  }

  function backMessage(msg: string) {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      console.log("Back:", msg);
      socket.emit("back", msg);         // custom event
    } else {
      console.log("Waiting for socket to connect...");
      socket.once("connect", () => socket.emit("back", msg));
    }
  }

  return [sendMessage, backMessage, messages] as const;
};

// export const useDemoWS = () => {
//   const wsr = useRef<WebSocket | null>(null);
//   const [messages, setMessages] = useState()
//
//   useEffect(() => {
//     // Create socket ONCE
//     const socket = new WebSocket("ws://localhost:8080");
//     wsr.current = socket;
//
//     socket.addEventListener("open", () => {
//       // console.log("✓ Connected to WebSocket server");
//     });
//
//     socket.addEventListener("message", (event) => {
//       console.log("Server message:", event.data);
//       setMessages(event.data);
//     });
//
//     // Cleanup
//     return () => {
//       socket.close();
//       // console.log("⨯ WebSocket closed");
//     };
//   }, []);
//
//   function sendMessage(msg: string) {
//     const socket = wsr.current;
//     if (!socket) return;
//
//     console.log("readyState =", socket.readyState);
//
//     if (socket.readyState === WebSocket.OPEN) {
//       // console.log("Sending:", msg);
//       socket.send(msg);
//     } else {
//       // console.log("Waiting for socket to open...");
//       socket.addEventListener("open", () => socket.send(msg), { once: true });
//     }
//   }
//
//   function backMessage(msg: string) {
//     const socket = wsr.current;
//     if (!socket) return;
//
//     console.log("readyState =", socket.readyState);
//
//     if (socket.readyState === WebSocket.OPEN) {
//       console.log("Sending:", msg);
//     } else {
//       console.log("Waiting for socket to open...");
//       socket.addEventListener("open", () => socket.send(msg), { once: true });
//     }
//   }
//
//   return [sendMessage, backMessage];
// };
