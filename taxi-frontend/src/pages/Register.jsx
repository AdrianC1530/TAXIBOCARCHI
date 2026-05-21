import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const SERVER = "http://localhost:3000";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    unidad: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.unidad || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const r = await fetch(`${SERVER}/auth/register-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const res = await r.json();

      if (r.ok) {
        setSuccess('Registro exitoso. El administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.');
        // Optionally redirect to login after a few seconds
        setTimeout(() => navigate('/login'), 5000);
      } else {
        setError(res.message || 'Error al registrar.');
      }
    } catch (e) {
      setError('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: 450 }}>
        <div className="login-header">
          <div className="login-logo">
            <Car size={26} strokeWidth={2.5} style={{ color: 'white' }} />
          </div>
          <h2 className="login-title">TaxiBocarchi</h2>
          <p className="login-subtitle">Registro para Conductores</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="alert-box alert-ok" style={{ marginBottom: 20 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-input"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
                disabled={loading || success}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                name="apellido"
                className="form-input"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                disabled={loading || success}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Número de Unidad</label>
            <input
              type="text"
              name="unidad"
              className="form-input"
              value={formData.unidad}
              onChange={handleChange}
              placeholder="Ej: 101"
              disabled={loading || success}
              required
            />
            <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
              Este será tu usuario para iniciar sesión.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading || success}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading || success}>
            {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              ¿Ya tienes cuenta o eres admin? Iniciar Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
