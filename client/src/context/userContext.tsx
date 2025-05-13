import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface User {
    username: string;
    _id: string;
    createdAt: Date
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode
}

export const UserProvider = (props: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('http://localhost:3000/session', {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user[0]);
                console.log("SESSION RETRIEVAL DATA", data)
            }
            else {
                console.error("CANT SAVE STATE")
                //redirect to re nav page probably
            }

        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {props.children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
