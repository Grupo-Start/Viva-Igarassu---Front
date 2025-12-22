import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { AdminDashboard }  from "../paginas/AdminDashboard/Dashboard/AdminDashboard";
import { PageUsers } from "../paginas/AdminDashboard/Users/PageUsers";
import { PageEmpresas } from "../paginas/AdminDashboard/Empresas/PageEmpresas";

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
    },
    {
        path: '/Admin-Dashboard',
        element: <AdminDashboard />
    },
    {
        path: '/Admin-Dashboard/Users',
        element: <PageUsers />
    },
    {
        path: '/Admin-Dashboard/Empresas',
        element: <PageEmpresas />
    }
])