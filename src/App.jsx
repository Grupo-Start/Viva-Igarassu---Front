import { RouterProvider } from "react-router-dom";
import { paginas } from "./routes/index.routes";
import './App.css'
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <div>
      <ErrorBoundary>
        <RouterProvider router={paginas} />
      </ErrorBoundary>
    </div>
  )
}