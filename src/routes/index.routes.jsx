import { createBrowserRouter } from "react-router-dom";
import { Home } from "../paginas/home/home";
import { Login } from "../paginas/Login/Login";
import { Register } from "../paginas/register/register";
import { RegisterPerson } from "../paginas/RegisterPerson/RegisterPerson";
import { Quemsomos } from "../paginas/Quemsomos/Quemsomos";
import { Telainicial } from "../paginas/Telainicial/Telainicial";
import { Pontoturistico } from "../paginas/pontoturistico/Pontoturistico";
import { Pontos } from "../paginas/pontos/pontos";
import { Telafigurinha } from "../paginas/telafigurinha/telafigurinha";

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
        path : '/quem-somos',
        element: <Quemsomos />
    },
     { 
        path : '/tela-inicial',
        element: <Telainicial />
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
        path: "/tela-figurinha",
        element: <Telafigurinha />
    }

])