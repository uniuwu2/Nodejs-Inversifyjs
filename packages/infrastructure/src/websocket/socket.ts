// initSocket.ts
import { Server, Socket } from "socket.io";

const studentSockets = new Map<string, string>();

export const initSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("register", (userId: string) => {
            studentSockets.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on("sendNoti", ({ toUserId, message }) => {
            const toSocketId = studentSockets.get(toUserId);
            if (toSocketId) {
                io.to(toSocketId).emit("noti", {
                    fromUserId: socket.id,
                    message,
                });
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, socketId] of studentSockets.entries()) {
                if (socketId === socket.id) {
                    studentSockets.delete(userId);
                    break;
                }
            }
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};