import React from 'react';
import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return <Navigate to="/login" replace />;
    const user = JSON.parse(raw);
    const tipo = (user.tipo || user.role || '').toString().toLowerCase();
    const isAdminFlag = user.isAdmin || user.is_admin || false;

    const allowed = isAdminFlag === true || tipo === 'adm' || tipo.includes('adm') || (user.role && user.role.toString().toLowerCase().includes('adm'));

    if (!allowed) return <Navigate to="/" replace />;
    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
}

export default AdminRoute;
