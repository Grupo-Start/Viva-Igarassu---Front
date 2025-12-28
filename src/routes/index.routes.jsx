import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { AdminDashboard }  from "../paginas/AdminDashboard/Dashboard/AdminDashboard";
import { PageUsers } from "../paginas/AdminDashboard/Users/PageUsers";
import { PageEmpresas } from "../paginas/AdminDashboard/Empresas/PageEmpresas";
import { PagePontosTuristicos } from "../paginas/AdminDashboard/PontosTuristicos/PagePontosTuristicos";
import { PageEventos } from "../paginas/AdminDashboard/Eventos/PageEventos";
import { PageRecompensas } from "../paginas/AdminDashboard/Recompensas/PageRecompensas";

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
        path : '/register-person',
        element: <RegisterPerson />
    },
    {
        path: '/admin-dashboard',
        element: <AdminDashboard />
    },
    {
        path: '/Admin-Dashboard/Users',
        element: <PageUsers />
    },
    {
        path: '/Admin-Dashboard/Empresas',
        element: <PageEmpresas />
    },
    {
        path: '/Admin-Dashboard/PontosTuristicos',
        element: <PagePontosTuristicos />
    },
    {
        path: '/Admin-Dashboard/Eventos',
        element: <PageEventos />
    },
    {
        path: '/Admin-Dashboard/Recompensas',
        element: <PageRecompensas />
    }
])