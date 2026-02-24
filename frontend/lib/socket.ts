import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(BACKEND_URL);
    }
    return socket;
};
