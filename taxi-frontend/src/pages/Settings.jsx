import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SERVER = "http://localhost:3000";

const Settings = () => {
  const { token } = useAuth();
  
  const [umbralPreventivo, setUmbralPreventivo] = useState(3);
  const [umbralDefinitivo, setUmbralDefinitivo] = useState(4);
  const [tiempoEspera, setTiempoEspera] = useState(60);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${SERVER}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setUmbralPreventivo(data.umbral_preventivo);
      setUmbralDefinitivo(data.umbral_definitivo);
      setTiempoEspera(data.tiempo_espera_segundos);
    } catch (e) {
      console.error("Error cargando configuración:", e);
      setMessage({ type: 'error', text: 'Error al obtener la configuración desde Firebase.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const r = await fetch(`${SERVER}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          umbral_preventivo: Number(umbralPreventivo),
          umbral_definitivo: Number(umbralDefinitivo),
          tiempo_espera_segundos: Number(tiempoEspera)
        })
      });

      if (!r.ok) throw new Error();
      
      setMessage({ type: 'success', text: 'Configuración actualizada en Firebase. El servidor de Flask y el Arduino aplicarán los umbrales automáticamente en su próxima inferencia.' });
    } catch (e) {
      console.error("Error al actualizar configuración:", e);
      setMessage({ type: 'error', text: 'No se pudo guardar la configuración. Revisa la conexión con NestJS.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div>
        <h2>Configuración del Sistema</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          Administra los límites y tiempos para el envío de alertas y notificaciones a Telegram.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <div className="empty">Cargando configuración desde Firebase...</div>
        </div>
      ) : (
        <div className="card form-card">
          <div className="card-title" style={{ marginBottom: 24 }}>Ajuste de Umbrales y Tiempos</div>
          
          {message.text && (
            <div 
              className={message.type === 'success' ? 'alert-box alert-ok' : 'login-error'}
              style={{ marginTop: 0, marginBottom: 24 }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Umbral Preventivo</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={umbralPreventivo}
                  onChange={(e) => setUmbralPreventivo(e.target.value)}
                  required
                />
                <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  Alerta preventiva a Telegram (Amarillo).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Umbral Definitivo</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={umbralDefinitivo}
                  onChange={(e) => setUmbralDefinitivo(e.target.value)}
                  required
                />
                <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  Alerta urgente a Telegram (Rojo).
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Tiempo Cooldown Anti-Spam (Segundos)</label>
              <input
                type="number"
                min="10"
                max="600"
                className="form-input"
                value={tiempoEspera}
                onChange={(e) => setTiempoEspera(e.target.value)}
                required
              />
              <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                Evita saturar Telegram esperando esta cantidad de segundos antes de enviar una nueva notificación idéntica.
              </span>
            </div>

            <div style={{ marginTop: 24 }}>
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Ajustes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
