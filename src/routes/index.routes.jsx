import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";


import { CompanyRegistration } from "../paginas/companyregistration/CompanyRegistration";


import { AdminDashboard } from "../paginas/AdminDashboard/Dashboard/AdminDashboard";
import { PageUsers } from "../paginas/AdminDashboard/Users/PageUsers";
import { PageEmpresas } from "../paginas/AdminDashboard/Empresas/PageEmpresas";
import { PagePontosTuristicos } from "../paginas/AdminDashboard/PontosTuristicos/PagePontosTuristicos";
import { PageEventos } from "../paginas/AdminDashboard/Eventos/PageEventos";
import { PageRecompensas } from "../paginas/AdminDashboard/Recompensas/PageRecompensas";
import { PasswordReset } from "../paginas/passwordreset/PasswordReset";
import { TokenReset } from "../paginas/tokenreset/TokenReset";
import { NewPassword } from "../paginas/newpassword/Newpassword";

import { EmpresaDashboard } from "../paginas/EmpresaDashboard/Dashboard/EmpresaDashboard";
import EmpresaRoute from "../components/guards/EmpresaRoute";
import AdminRoute from "../components/guards/AdminRoute";
import { EmpresaRecompensas } from "../paginas/EmpresaDashboard/Recompensas/EmpresaRecompensas";
import { EmpresaEventos } from "../paginas/EmpresaDashboard/Eventos/EmpresaEventos";
import { EmpresaMeusDados} from "../paginas/EmpresaDashboard/MeusDados/EmpresaMeusDados";

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
        path: '/register-person',
        element: <RegisterPerson />
    },
    {
        path: '/admin-dashboard',
        element: <AdminDashboard />
    },
    {

        path: '/company-registration',
        element: <CompanyRegistration />
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

    },
    {
        path: '/passwordreset',
        element: <PasswordReset />
    },
    {
        path: '/tokenreset',
        element: <TokenReset />

    },
    {
       path: '/newpassword',
       element: <NewPassword/>
    }
        {
                path: '/Admin-Dashboard',
                element: (
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                )
        },
        {
                path: '/Admin-Dashboard/Users',
                element: (
                    <AdminRoute>
                        <PageUsers />
                    </AdminRoute>
                )
        },
        {
                path: '/Admin-Dashboard/Empresas',
                element: (
                    <AdminRoute>
                        <PageEmpresas />
                    </AdminRoute>
                )
        },
        {
                path: '/Admin-Dashboard/PontosTuristicos',
                element: (
                    <AdminRoute>
                        <PagePontosTuristicos />
                    </AdminRoute>
                )
        },
        {
                path: '/Admin-Dashboard/Eventos',
                element: (
                    <AdminRoute>
                        <PageEventos />
                    </AdminRoute>
                )
        },
        {
                path: '/Admin-Dashboard/Recompensas',
                element: (
                    <AdminRoute>
                        <PageRecompensas />
                    </AdminRoute>
                )
        },
        {
                path: '/Empresa-Dashboard',
                element: (
                    <EmpresaRoute>
                        <EmpresaDashboard />
                    </EmpresaRoute>
                )
        },
        {
                path: '/Empresa-Dashboard/MeusDados',
                element: (
                    <EmpresaRoute>
                        <EmpresaMeusDados />
                    </EmpresaRoute>
                )
        },
        {
                path: '/Empresa-Dashboard/Recompensas',
                element: (
                    <EmpresaRoute>
                        <EmpresaRecompensas />
                    </EmpresaRoute>
                )
        },
        {
                path: '/Empresa-Dashboard/Eventos',
                element: (
                    <EmpresaRoute>
                        <EmpresaEventos />
                    </EmpresaRoute>
                )
        }
])