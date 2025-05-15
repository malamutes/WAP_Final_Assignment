import React, { createContext, useContext, useState, useEffect, type SetStateAction } from "react";

interface Notification {
    _id: string;
    postId: string;
    recipientId: string;
    seen: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    setNotification: React.Dispatch<SetStateAction<Notification[]>>
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotificationContext must be used within a NotificationProvider");
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider = (props: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchNotifs = async () => {
            const res = await fetch('http://localhost:3000/profile/notification', {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                console.log("NOTIF RETRIEVAL", data)
                setNotifications(data.notifications);
            }
            else {
                console.error("NO NOTIFS FOUND")
                //redirect to re nav page probably
            }

        };

        fetchNotifs();
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications: notifications,
            setNotification: setNotifications
        }}>
            {props.children}
        </NotificationContext.Provider>
    );
};

export const useNoticationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
