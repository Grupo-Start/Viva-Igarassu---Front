import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";

export const paginas = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login />
    }
])