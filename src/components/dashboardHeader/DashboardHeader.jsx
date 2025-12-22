import './DashboardHeader.css';
import { Link } from 'react-router-dom';

export function DashboardHeader() {
  return (
    <header className="header">
  
      <div className="header-logo">
       <img src="/header-logo.png" alt="logo viva igarassu" />
      </div>

        <Link to="/Admin" className="Admin">
          <span>Admin</span>
          <img src="/icone-login.png" alt="Admin" />
        </Link>

    </header>
  );
}
