import { RouterProvider } from "react-router-dom";
import { paginas } from "./routes/index.routes";
import './App.css'

export default function App() {
  return (
    <div>
      {/* <div style={{padding: "0.5rem 1rem", background: "#f0f0f0", color: "#111", fontWeight: 600}}>App montada — debug</div> */}
      <RouterProvider router={paginas} />
    </div>
  )
}