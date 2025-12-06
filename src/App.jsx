import { RouterProvider } from "react-router-dom";
import { paginas } from "./routes/index.routes";

export default function App() {
  return (
    <div>
      <RouterProvider router={paginas} />
    </div>
  )
}