import React from 'react';
import { Navigate } from 'react-router-dom';

export function EmpresaRoute({ children }) {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return <Navigate to="/login" replace />;
    const user = JSON.parse(raw);
    const tipo = (user.tipo || user.role || '').toString().toLowerCase();
    const isEmpresaFlag = user.isEmpresa || user.is_empresa || user.isCompany || false;

    const allowed = isEmpresaFlag === true || tipo.includes('empresa') || tipo.includes('empreendedor') || tipo.includes('empresa_empre') || tipo.includes('empreendedor');

    if (!allowed) return <Navigate to="/" replace />;
    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
}

export default EmpresaRoute;
