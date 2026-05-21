import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Car,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Car size={20} strokeWidth={2.5} />
        </div>
        <span className="sidebar-title">TaxiBocarchi</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <History size={18} />
          <span>Historial</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Estadísticas</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/drivers-admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} />
            <span>Solicitudes</span>
          </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Configuración</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user ? getInitials(user.name) : <User size={14} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Cargando...'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>
              Administrador
            </span>
          </div>
        </div>
        <button onClick={logout} className="sidebar-logout">
          <LogOut size={15} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
