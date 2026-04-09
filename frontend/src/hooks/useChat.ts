import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";

const socket = io("http://localhost:8000");

export function useChat(appointmentId: string | number, user: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any>(null);
    const [completedAt, setCompletedAt] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [audioRecordingUrl, setAudioRecordingUrl] = useState<string | null>(null);
    const [consultationDuration, setConsultationDuration] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const prevMessagesLength = useRef(0);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<number, boolean>>({});

    // Edit state
    const [editingMsg, setEditingMsg] = useState<any>(null);
    const [editInput, setEditInput] = useState("");

    const addMessage = useCallback((msg: any) => {
        setMessages(prev => {
            if (msg.id && prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });

        if (msg.senderId !== user?.id) {
            socket.emit("markSeen", { messageId: msg.id, senderId: msg.senderId });
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user || !appointmentId) return;

        socket.emit("register", user.id);

        apiClient.get(`/api/chat/appointment/${appointmentId}?skip=0&take=30`).then(res => {
            const initialMsgs = res.data.messages || res.data || [];
            setMessages(initialMsgs);
            const pr = res.data.participants;
            setParticipants(pr);
            if (res.data.completedAt) setCompletedAt(res.data.completedAt);

            if (pr) {
                if (pr.doctor?.userId) socket.emit("checkStatus", pr.doctor.userId);
                if (pr.patient?.userId) socket.emit("checkStatus", pr.patient.userId);
            }
            if (res.data.startedAt) setStartedAt(res.data.startedAt);
            if (res.data.status) setStatus(res.data.status);
            if (res.data.audioRecordingUrl) setAudioRecordingUrl(res.data.audioRecordingUrl);
            if (res.data.consultationDuration) setConsultationDuration(res.data.consultationDuration);

            if (initialMsgs.length < 30) setHasMore(false);

            initialMsgs.forEach((m: any) => {
                if (m.senderId !== user.id && !m.isRead) {
                    socket.emit("markSeen", { messageId: m.id, senderId: m.senderId });
                }
            });
        }).catch(err => {
            console.error(err);
            toast.error("Error fetching chat");
        });

        const aid = parseInt(appointmentId.toString());

        const handleNewMessage = (msg: any) => {
            if (msg.appointmentId === aid) addMessage(msg);
        };

        const handleMessageSaved = (msg: any) => {
            if (msg.appointmentId === aid) addMessage(msg);
        };

        const handleMessageSeen = ({ messageId }: any) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
        };

        const handleMessageEdited = (msg: any) => {
            if (msg.appointmentId === aid) {
                setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
            }
        };

        const handleMessageDeleted = ({ messageId, appointmentId: msgAid }: any) => {
            if (msgAid === aid) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        };

        const handleUserStatus = ({ userId, online }: { userId: number, online: boolean }) => {
            setOnlineStatuses(prev => ({ ...prev, [userId]: online }));
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageSaved", handleMessageSaved);
        socket.on("messageSeen", handleMessageSeen);
        socket.on("messageEdited", handleMessageEdited);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("userStatusChanged", handleUserStatus);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageSaved", handleMessageSaved);
            socket.off("messageSeen", handleMessageSeen);
            socket.off("messageEdited", handleMessageEdited);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("userStatusChanged", handleUserStatus);
        };
    }, [appointmentId, user, addMessage]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container && messages.length > prevMessagesLength.current) {
            if (messages.length - prevMessagesLength.current === 1) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container && container.scrollTop === 0 && hasMore && !isLoadingMore) {
            loadMore();
        }
    };

    const loadMore = async () => {
        if (!appointmentId || !hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextSkip = skip + 30;
            const res = await apiClient.get(`/api/chat/appointment/${appointmentId}?skip=${nextSkip}&take=30`);
            const msgs = res.data.messages || res.data || [];
            if (msgs.length < 30) setHasMore(false);

            const container = messagesContainerRef.current;
            const oldScrollHeight = container?.scrollHeight || 0;

            setMessages(prev => [...msgs, ...prev]);
            setSkip(nextSkip);

            setTimeout(() => {
                const newContainer = messagesContainerRef.current;
                if (newContainer) {
                    newContainer.scrollTop = newContainer.scrollHeight - oldScrollHeight;
                }
            }, 0);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const sendMessage = (content: string, fileData?: { url: string, type: string }) => {
        if (!user || !appointmentId) return;

        let receiverId = 0;
        if (participants) {
            if (user.role === 'DOCTOR') receiverId = participants.patient?.userId || 0;
            else receiverId = participants.doctor?.userId || 0;
        }

        socket.emit("sendMessage", {
            senderId: user.id,
            receiverId,
            content,
            fileUrl: fileData?.url,
            fileType: fileData?.type,
            appointmentId: parseInt(appointmentId.toString())
        });
    };

    const deleteMessage = (messageId: number) => {
        socket.emit("deleteMessage", { messageId, userId: user?.id });
    };

    const editMessage = (messageId: number, newContent: string) => {
        socket.emit("editMessage", { messageId, userId: user?.id, newContent });
        setEditingMsg(null);
        setEditInput("");
    };

    const clearHistory = async () => {
        try {
            await apiClient.delete(`/api/chat/appointment/${appointmentId}`);
            setMessages([]);
            toast.success("Chat history cleared successfully");
        } catch (error) {
            console.error("Failed to clear chat history", error);
            toast.error("Failed to clear chat history");
        }
    };

    return {
        messages,
        setMessages,
        participants,
        completedAt,
        isUploading,
        setIsUploading,
        isLoadingMore,
        hasMore,
        messagesContainerRef,
        handleScroll,
        sendMessage,
        deleteMessage,
        editMessage,
        clearHistory,
        editingMsg,
        setEditingMsg,
        editInput,
        setEditInput,
        onlineStatuses,
        startedAt,
        status,
        audioRecordingUrl,
        consultationDuration
    };
}
