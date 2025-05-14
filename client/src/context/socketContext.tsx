// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, type SetStateAction } from 'react';
import { io, Socket } from 'socket.io-client';

interface ConnectedUser {
    socketId: string;
    userId: string;
    username: string;
}

interface SocketContextInterface {
    socket: Socket | null,
    connectedUsers: ConnectedUser[],
    setConnectedUsers: React.Dispatch<SetStateAction<ConnectedUser[]>>
}
const SocketContext = createContext<SocketContextInterface>({
    socket: null,
    connectedUsers: [],
    setConnectedUsers: () => { }
});

export const useSocket = () => {
    return useContext(SocketContext);
};

interface SocketProviderProps {
    children: React.ReactNode
}

export const SocketProvider = (props: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

    useEffect(() => {
        const socket = io('http://localhost:3000', { withCredentials: true });
        setSocket(socket);

        if (socket.connected) {
            console.log('Client already connected');
        } else {
            socket.on('connect', () => {
                console.log('Client connected to server');
            });
        }
        //PRINTING ALL USERS CONNECTED
        socket.on("UPDATED_USERS_LIST", (users) => { console.log(users); setConnectedUsers(users) });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };

    }, []);


    useEffect(() => {
        console.log(connectedUsers);
    }, [connectedUsers]);

    return (
        <SocketContext.Provider value={{
            socket: socket,
            connectedUsers: connectedUsers,
            setConnectedUsers: setConnectedUsers
        }}>
            {props.children}
        </SocketContext.Provider>
    );
};
