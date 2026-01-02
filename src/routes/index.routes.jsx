import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { AdminDashboard } from "../paginas/AdminDashboard/AdminDashboard";
import { DashboardEmpresa } from "../paginas/dashboardEmpresa/dashboardEmpresa";
import { UsuarioDashboard } from "../paginas/UsuarioDashboard/UsuarioDashboard";
import { UsuarioDados } from "../paginas/UsuarioDados/Usuariodados";
import { UsuarioFigurinhas } from "../paginas/UsuarioFigurinhas/UsuarioFigurinhas";

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
        path: '/dashboardEmpresa',
        element: <DashboardEmpresa />
    },
    {
        path: '/usuarioDashboard',
        element: <UsuarioDashboard />
    },
    {
        path: '/usuarioDados',
        element: <UsuarioDados />
    },
    {
        path: '/usuarioFigurinhas',
        element: <UsuarioFigurinhas />
    }
])