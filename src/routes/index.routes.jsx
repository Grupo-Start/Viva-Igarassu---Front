import { createBrowserRouter } from "react-router-dom";

import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { CompanyRegistration } from "../paginas/companyregistration/CompanyRegistration";
import { PasswordReset } from "../paginas/Passwords/passwordreset/PasswordReset";
import { TokenReset } from "../paginas/Passwords/tokenreset/TokenReset";
import { NewPassword } from "../paginas/Passwords/newpassword/NewPassword";
import { AlterarSenha } from "../paginas/Passwords/passwordlogged/passwordlogged";

import { Quemsomos } from "../paginas/Quemsomos/Quemsomos";
import { Pontoturistico } from "../paginas/Trilha/pontoturistico/Pontoturistico";
import { Pontos } from "../paginas/Trilha/pontos/pontos";
import { Telafigurinha } from "../paginas/Trilha/telafigurinha/telafigurinha";
import { ScanQRCode } from "../paginas/Trilha/ScanQRCode/scanqrcode";
import { NotFound } from "../paginas/NotFound/NotFound";

import { AdminDashboard } from "../paginas/AdminDashboard/Dashboard/AdminDashboard";
import { PageUsers } from "../paginas/AdminDashboard/Users/PageUsers";
import { PageEmpresas } from "../paginas/AdminDashboard/Empresas/PageEmpresas";
import { PagePontosTuristicos } from "../paginas/AdminDashboard/PontosTuristicos/PagePontosTuristicos";
import { PageEventos } from "../paginas/AdminDashboard/Eventos/PageEventos";
import { PageRecompensas } from "../paginas/AdminDashboard/Recompensas/PageRecompensas";
import AdminRoute from "../components/guards/AdminRoute";

import { EmpresaDashboard } from "../paginas/EmpresaDashboard/Dashboard/EmpresaDashboard";
import { EmpresaRecompensas } from "../paginas/EmpresaDashboard/Recompensas/EmpresaRecompensas";
import { EmpresaEventos } from "../paginas/EmpresaDashboard/Eventos/EmpresaEventos";
import { EmpresaMeusDados } from "../paginas/EmpresaDashboard/MeusDados/EmpresaMeusDados";
import EmpresaRoute from "../components/guards/EmpresaRoute";

import { DashboardEmpresa } from "../paginas/dashboardEmpresa/dashboardEmpresa";
import { UsuarioDashboard } from "../paginas/DashboardUsuario/UsuarioDashboard/UsuarioDashboard";
import { UsuarioDados } from "../paginas/DashboardUsuario/UsuarioDados/Usuariodados";
import { UsuarioFigurinhas } from "../paginas/DashboardUsuario/UsuarioFigurinhas/UsuarioFigurinhas";

export const paginas = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/quem-somos", element: <Quemsomos /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/register-person", element: <RegisterPerson /> },
  { path: "/company-registration", element: <CompanyRegistration /> },
  { path: "/password-reset", element: <PasswordReset /> },
  { path: "/token-reset", element: <TokenReset /> },
  { path: "/reset-password", element: <NewPassword /> },

  { path: "/pontos-turisticos", element: <Pontos /> },
  { path: "/pontos-turisticos/:id", element: <Pontoturistico /> },

  { path: "/scan", element: <ScanQRCode /> },
  { path: "/scan/:pointId", element: <ScanQRCode /> },
  { path: "/tela-figurinha", element: <Telafigurinha /> },

  { path: "/alterar-senha", element: <AlterarSenha /> },

  { path: "/admin-dashboard", element: <AdminRoute><AdminDashboard /></AdminRoute> },
  { path: "/admin-dashboard/users", element: <AdminRoute><PageUsers /></AdminRoute> },
  { path: "/admin-dashboard/empresas", element: <AdminRoute><PageEmpresas /></AdminRoute> },
  { path: "/admin-dashboard/pontos-turisticos", element: <AdminRoute><PagePontosTuristicos /></AdminRoute> },
  { path: "/admin-dashboard/eventos", element: <AdminRoute><PageEventos /></AdminRoute> },
  { path: "/admin-dashboard/recompensas", element: <AdminRoute><PageRecompensas /></AdminRoute> },

  { path: "/empresa-dashboard", element: <EmpresaRoute><EmpresaDashboard /></EmpresaRoute> },
  { path: "/empresa-dashboard/meus-dados", element: <EmpresaRoute><EmpresaMeusDados /></EmpresaRoute> },
  { path: "/empresa-dashboard/recompensas", element: <EmpresaRoute><EmpresaRecompensas /></EmpresaRoute> },
  { path: "/empresa-dashboard/eventos", element: <EmpresaRoute><EmpresaEventos /></EmpresaRoute> },

  { path: "/dashboardEmpresa", element: <DashboardEmpresa /> },
  { path: "/usuarioDashboard", element: <UsuarioDashboard /> },
  { path: "/usuarioDados", element: <UsuarioDados /> },
  { path: "/usuarioFigurinhas", element: <UsuarioFigurinhas /> },

  { path: "*", element: <NotFound /> },
]);