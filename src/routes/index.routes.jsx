import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";

export const paginas = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    { 
        path : '/RegisterPerson',
        element: <RegisterPerson />
    }
])