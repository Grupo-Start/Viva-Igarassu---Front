import { Sidebar } from "../../components/sidebar/Sidebar"
import { Header } from "../../components/header/Header"

export function DashboardEmpresa() {
  return (
    <div>
          <header>
            <Header/>
        </header>
        <nav>
            <Sidebar/>
        </nav>
      </div>
  )
}