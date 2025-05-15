// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, type SetStateAction } from 'react';
import { io, Socket } from 'socket.io-client';

type Subscription = {
    createdAt: Date;
    targetUserId: string;
    username: string;
};

interface ConnectedUser {
    socketId: string;
    userId: string;
    username: string;
}

interface SocketContextInterface {
    socket: Socket | null,
    connectedUsers: ConnectedUser[],
    setConnectedUsers: React.Dispatch<SetStateAction<ConnectedUser[]>>,
    connected: boolean,
    setConnected: React.Dispatch<SetStateAction<boolean>>
}
const SocketContext = createContext<SocketContextInterface>({
    socket: null,
    connectedUsers: [],
    setConnectedUsers: () => { },
    connected: false,
    setConnected: () => { }
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
    const [connected, setConnected] = useState<boolean>(false);


    const getAllSubscription = async (socket: Socket) => {
        let subscriptionArray = [];
        let subscribersArray = [];
        const subscribers = await fetch('http://localhost:3000/profile/getAllSubscribers', {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": 'application/json'
            }
        })

        const subscribersReply = await subscribers.json();

        if (subscribers.ok) {
            subscribersArray = subscribersReply.subscribers
        }
        else {
            console.log(subscribersReply.message)
        }

        const subscription = await fetch('http://localhost:3000/profile/getAllSubscriptions', {
            method: "GET",
            credentials: 'include',
            headers: {
                "Accept": 'application/json'
            }
        })

        const subscriptionReply = await subscription.json();

        if (subscription.ok) {
            //console.log(reply);
            subscriptionArray = subscriptionReply.subscriptions.map((s: Subscription) => s.targetUserId)
        }
        else {
            console.log(subscriptionReply.message)
        }

        socket?.emit(
            "USER_SUBSCRIPTIONS",
            subscriptionArray, subscribersArray
        );
        console.log(subscriptionArray, subscribersArray);
    }


    useEffect(() => {
        const socket = io('http://localhost:3000', { withCredentials: true });
        setSocket(socket);

        if (socket.connected) {
            console.log('Client already connected');
            setConnected(true);
            getAllSubscription(socket);
        } else {
            socket.on('connect', () => {
                console.log('Client connected to server');
                setConnected(true);
                getAllSubscription(socket);
            });
        }


        socket.on("NEW_POST", (msg) => console.log("NEW POST NOTIF", msg));

        //PRINTING ALL USERS CONNECTED
        socket.on("UPDATED_USERS_LIST", (users) => { console.log(users); setConnectedUsers(users) });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            setConnected(false)
        };

    }, []);


    useEffect(() => {
        console.log(connectedUsers);
    }, [connectedUsers]);

    return (
        <SocketContext.Provider value={{
            socket: socket,
            connectedUsers: connectedUsers,
            setConnectedUsers: setConnectedUsers,
            connected: connected,
            setConnected: setConnected
        }}>
            {props.children}
        </SocketContext.Provider>
    );
};
