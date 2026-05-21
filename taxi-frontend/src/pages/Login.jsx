import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir a donde quería ir el usuario, o al home por defecto
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa tus credenciales.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Credenciales inválidas o error de servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Car size={26} strokeWidth={2.5} style={{ color: 'white' }} />
          </div>
          <h2 className="login-title">TaxiBocarchi</h2>
          <p className="login-subtitle">Inicia sesión para acceder al panel administrativo</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/register" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              ¿Eres taxista? Regístrate aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
