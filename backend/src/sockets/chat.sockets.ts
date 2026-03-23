import { Server as HttpServer } from "http";
import { saveMessage } from "../services/chat.services";
import { initSocket, setUserSocket, removeUserSocketBySocketId, emitToUser, getUserSockets } from "./socket.manager";

export function setupChatSocket(server: HttpServer) {
    const io = initSocket(server);

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register", (userId: number) => {
            setUserSocket(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on("sendMessage", async ({ senderId, receiverId, content, appointmentId, fileUrl, fileType }) => {
            try {
                // Check 24h limit
                const { getAppointmentById } = require("../services/appointment.services");
                const appointment = await getAppointmentById(appointmentId);

                if (appointment && appointment.status === "COMPLETED" && appointment.completedAt) {
                    const completed = new Date(appointment.completedAt).getTime();
                    const now = new Date().getTime();
                    if (now - completed > 24 * 60 * 60 * 1000) {
                        socket.emit("error", { message: "Chat window has closed (24h limit reached)" });
                        return;
                    }
                }

                // Save to DB
                const msg = await saveMessage(senderId, receiverId, content, appointmentId, fileUrl, fileType);

                // Emitting to receiver using the resolved receiverId from the saved message
                emitToUser(msg.receiverId, "newMessage", msg);

                // Send ack back to sender with saved message
                socket.emit("messageSaved", msg);
            } catch (error) {
                console.error("Error saving message", error);
            }
        });

        socket.on("markSeen", async ({ messageId, senderId }) => {
            const { markAsSeen } = require("../services/chat.services");
            const msg = await markAsSeen(messageId);
            // Notify the original sender that their message was seen
            emitToUser(msg.senderId, "messageSeen", { messageId, receiverId: msg.receiverId });
        });

        socket.on("editMessage", async ({ messageId, userId, newContent }) => {
            try {
                const { getMessageById } = require("../services/chat.services");
                const existingMsg = await getMessageById(messageId);
                
                if (existingMsg && existingMsg.appointmentId) {
                    const { getAppointmentById } = require("../services/appointment.services");
                    const appointment = await getAppointmentById(existingMsg.appointmentId);
                    if (appointment && appointment.status === "COMPLETED" && appointment.completedAt) {
                        const completed = new Date(appointment.completedAt).getTime();
                        if (new Date().getTime() - completed > 24 * 60 * 60 * 1000) {
                            socket.emit("error", { message: "Cannot edit: Chat window closed" });
                            return;
                        }
                    }
                }

                const { editMessage } = require("../services/chat.services");
                const msg = await editMessage(messageId, userId, newContent);
                // Notify both
                emitToUser(msg.senderId, "messageEdited", msg);
                emitToUser(msg.receiverId, "messageEdited", msg);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("deleteMessage", async ({ messageId, userId }) => {
            try {
                const { getMessageById } = require("../services/chat.services");
                const existingMsg = await getMessageById(messageId);
                
                if (existingMsg && existingMsg.appointmentId) {
                    const { getAppointmentById } = require("../services/appointment.services");
                    const appointment = await getAppointmentById(existingMsg.appointmentId);
                    if (appointment && appointment.status === "COMPLETED" && appointment.completedAt) {
                        const completed = new Date(appointment.completedAt).getTime();
                        if (new Date().getTime() - completed > 24 * 60 * 60 * 1000) {
                            socket.emit("error", { message: "Cannot delete: Chat window closed" });
                            return;
                        }
                    }
                }

                const { deleteMessage } = require("../services/chat.services");
                const msg = await deleteMessage(messageId, userId);
                // Notify both
                emitToUser(msg.senderId, "messageDeleted", { messageId, appointmentId: msg.appointmentId });
                emitToUser(msg.receiverId, "messageDeleted", { messageId, appointmentId: msg.appointmentId });
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("checkStatus", (userId: number) => {
            const { isUserOnline } = require("./socket.manager");
            socket.emit("userStatusChanged", { userId, online: isUserOnline(userId) });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            removeUserSocketBySocketId(socket.id);
        });
    });

    return io;
}
