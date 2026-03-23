import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer;
// userId -> Set of socketIds
const userSockets = new Map<number, Set<string>>(); 

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const setUserSocket = (userId: number, socketId: string) => {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    const sockets = userSockets.get(userId)!;
    const wasOffline = sockets.size === 0;
    
    sockets.add(socketId);

    if (wasOffline && io) {
        io.emit("userStatusChanged", { userId, online: true });
    }
};

export const removeUserSocketBySocketId = (socketId: string) => {
    for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socketId)) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                userSockets.delete(userId);
                if (io) {
                    io.emit("userStatusChanged", { userId, online: false });
                }
            }
            break;
        }
    }
};

export const getUserSockets = (userId: number) => {
    return userSockets.get(userId);
};

export const isUserOnline = (userId: number) => {
    const sockets = userSockets.get(userId);
    return sockets && sockets.size > 0;
};

export const emitToUser = (userId: number, event: string, data: any) => {
    const sockets = userSockets.get(userId);
    if (sockets && io) {
        sockets.forEach(sid => {
            io.to(sid).emit(event, data);
        });
    }
};
