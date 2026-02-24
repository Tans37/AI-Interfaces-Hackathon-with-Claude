import client from './redis.js';

export function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', ({ roomId, userId }) => {
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;
            console.log(`User ${userId} joined room ${roomId}`);
        });

        socket.on('card-move', async ({ cardId, x, y }) => {
            if (!socket.roomId) return;

            // Update position in RedisJSON
            try {
                await client.json.set(`card:${cardId}`, '$.x', x);
                await client.json.set(`card:${cardId}`, '$.y', y);

                // Broadcast to others in the room
                socket.to(socket.roomId).emit('card-move', { cardId, x, y });
            } catch (err) {
                console.error('Error updating card position:', err);
            }
        });

        socket.on('cursor-move', ({ x, y, color }) => {
            if (!socket.roomId || !socket.userId) return;

            socket.to(socket.roomId).emit('cursor-move', {
                userId: socket.userId,
                x,
                y,
                color
            });
        });

        socket.on('magnet-applied', ({ roomId, match, noMatch }) => {
            io.to(roomId).emit('magnet-applied', { match, noMatch });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
