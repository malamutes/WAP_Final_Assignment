import { createBrowserRouter } from "react-router";
import App from "./App";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import Home from "./pages/home/Home";
import Post from "./pages/post/Post";
import PostDetail from "./pages/post/components/PostDetail";
import Profile from "./pages/profile/Profile";
import CreatePost from "./pages/post/CreatePost";
import MyPosts from "./pages/post/MyPosts";
import EditPost from "./pages/post/EditPost";
import Subscription from "./pages/subscription/Subscription";

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                index: true,
                Component: Home
            },
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
            },
            {
                path: 'post',
                Component: Post,
                children: [
                    { path: ":postID", Component: PostDetail },
                    { path: "create", Component: CreatePost },
                    { path: 'myPosts', Component: MyPosts },
                    {
                        path: 'edit',
                        children: [
                            { path: ':postID', Component: EditPost }, // Edit a specific post
                        ],
                    },
                ],
            },
            {
                path: 'profile',
                children: [
                    { path: ":profileID", Component: Profile },
                ],
            },
            {
                path: 'subscription', Component: Subscription
            }
        ],
    },
]);