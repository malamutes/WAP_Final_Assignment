import { createBrowserRouter } from "react-router";
import App from "./App";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import Home from "./pages/home/Home";

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                path: 'register',
                Component: Register
            },
            {
                path: 'login',
                Component: Login
            },
            {
                path: 'home',
                Component: Home
            }
        ],
    },
]);