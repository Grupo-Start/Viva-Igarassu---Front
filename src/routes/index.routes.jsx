import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { Quemsomos } from "../paginas/Quemsomos/Quemsomos";
import { Pontoturistico } from "../paginas/pontoturistico/Pontoturistico";
import { Pontos } from "../paginas/pontos/pontos";
import { Telafigurinha } from "../paginas/telafigurinha/telafigurinha";
import { CompanyRegistration } from "../paginas/companyregistration/CompanyRegistration";
import { AdminDashboard } from "../paginas/AdminDashboard/Dashboard/AdminDashboard";
import { PageUsers } from "../paginas/AdminDashboard/Users/PageUsers";
import { PageEmpresas } from "../paginas/AdminDashboard/Empresas/PageEmpresas";
import { PagePontosTuristicos } from "../paginas/AdminDashboard/PontosTuristicos/PagePontosTuristicos";
import { PageEventos } from "../paginas/AdminDashboard/Eventos/PageEventos";
import { PageRecompensas } from "../paginas/AdminDashboard/Recompensas/PageRecompensas";
import { PasswordReset } from "../paginas/passwordreset/PasswordReset";
import { TokenReset } from "../paginas/tokenreset/TokenReset";
import { NewPassword } from "../paginas/newpassword/NewPassword";
import { EmpresaDashboard } from "../paginas/EmpresaDashboard/Dashboard/EmpresaDashboard";
import EmpresaRoute from "../components/guards/EmpresaRoute";
import AdminRoute from "../components/guards/AdminRoute";
import { EmpresaRecompensas } from "../paginas/EmpresaDashboard/Recompensas/EmpresaRecompensas";
import { EmpresaEventos } from "../paginas/EmpresaDashboard/Eventos/EmpresaEventos";
import { EmpresaMeusDados} from "../paginas/EmpresaDashboard/MeusDados/EmpresaMeusDados";
import { ScanQRCode } from "../paginas/ScanQRCode/scanqrcode";
import { EventsPage } from "../paginas/eventspage/EventsPage";
import { CarnivalPage } from "../paginas/carnivalPage/CarnivalPage";
import { RewardsPage } from "../paginas/rewardspage/RewardsPage";

export const paginas = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    { 
        path : '/quem-somos',
        element: <Quemsomos />
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
        path: '/company-registration',
        element: <CompanyRegistration />
    },
    {
        path: '/password-reset',
        element: <PasswordReset />
    },
    {
        path: '/token-reset',
        element: <TokenReset />
    },
    {
        path: '/reset-password',
        element: <NewPassword/>
    },
    {
        path: '/admin-dashboard',
        element: (
            <AdminRoute>
                <AdminDashboard />
            </AdminRoute>
        )
            },
            {
                path: '/admin-dashboard/users',
                element: (
                    <AdminRoute>
                        <PageUsers />
                    </AdminRoute>
                )
        },
        {
            path: '/admin-dashboard/empresas',
            element: (
                <AdminRoute>
                        <PageEmpresas />
                    </AdminRoute>
                )
            },
            {
                path: '/admin-dashboard/pontos-turisticos',
                element: (
                    <AdminRoute>
                        <PagePontosTuristicos />
                    </AdminRoute>
                )
            },
            {
                path: '/admin-dashboard/eventos',
                element: (
                    <AdminRoute>
                        <PageEventos />
                    </AdminRoute>
                )
            },
            {
                path: '/admin-dashboard/recompensas',
                element: (
                    <AdminRoute>
                        <PageRecompensas />
                    </AdminRoute>
                )
            },
        {
            path: '/empresa-dashboard',
            element: (
                <EmpresaRoute>
                        <EmpresaDashboard />
                    </EmpresaRoute>
                )
        },
        {
                path: '/empresa-dashboard/meus-dados',
                element: (
                    <EmpresaRoute>
                        <EmpresaMeusDados />
                    </EmpresaRoute>
                )
            },
            {
                path: '/empresa-dashboard/recompensas',
                element: (
                    <EmpresaRoute>
                        <EmpresaRecompensas />
                    </EmpresaRoute>
                )
            },
            {
                path: '/empresa-dashboard/eventos',
                element: (
                    <EmpresaRoute>
                        <EmpresaEventos />
                    </EmpresaRoute>
                )
            }
            ,
            {
                path: '/scan',
            element: <ScanQRCode />
        },
        {
            path: "/pontos",
            element: <Pontos />
        },
        { 
            path : '/ponto/:id',
            element: <Pontoturistico />
        },
        {
            path: '/scan/:pointId',
            element: <ScanQRCode />
        },
        {
            path: "/tela-figurinha",
            element: <Telafigurinha />
        },
        {
            path: '/eventspage',
            element: <EventsPage/>
        },
        {
            path: '/carnivalpage',
            element: <CarnivalPage/> 
        },
        {
            path: '/rewardspage',
            element: <RewardsPage/>
        }
])