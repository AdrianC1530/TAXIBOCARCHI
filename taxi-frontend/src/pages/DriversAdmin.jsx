import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, UserCheck } from 'lucide-react';

const SERVER = "http://localhost:3000";

const DriversAdmin = () => {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${SERVER}/auth/pending-drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const data = await r.json();
        setDrivers(data);
      }
    } catch (e) {
      console.error("Error fetching pending drivers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, [token]);

  const handleApprove = async (id, name) => {
    try {
      const r = await fetch(`${SERVER}/auth/approve-driver/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (r.ok) {
        setMessage(`Taxista ${name} aprobado exitosamente.`);
        fetchPendingDrivers();
      }
    } catch (e) {
      console.error(e);
      setMessage("Error al aprobar.");
    }
  };

  const handleReject = async (id, name) => {
    try {
      const r = await fetch(`${SERVER}/auth/approve-driver/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (r.ok) {
        setMessage(`Solicitud de ${name} rechazada.`);
        fetchPendingDrivers();
      }
    } catch (e) {
      console.error(e);
      setMessage("Error al rechazar.");
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2>Solicitudes de Taxistas</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Administra los registros pendientes de los conductores de la cooperativa.
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchPendingDrivers}>
          Actualizar Lista
        </button>
      </div>

      {message && (
        <div className="alert-box alert-ok" style={{ marginBottom: 20 }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="empty" style={{ padding: '40px 0' }}>Cargando solicitudes...</div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="card">
          <div className="empty" style={{ padding: '40px 0' }}>
            <UserCheck size={32} style={{ color: 'var(--muted)', marginBottom: 10 }} />
            <div>No hay solicitudes pendientes.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {drivers.map(driver => (
            <div key={driver.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{driver.name}</h3>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} />
                    Registrado el: {new Date(driver.createdAt?._seconds * 1000 || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div className="badge badge-amber" style={{ fontSize: 10 }}>Pendiente</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Información del Conductor</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><strong>Cédula:</strong> {driver.cedula || 'N/A'}</div>
                <div style={{ fontSize: 14, marginBottom: 12 }}><strong>Teléfono:</strong> {driver.telefono || 'N/A'}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Unidad Asignada</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{driver.unidad}</div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button 
                  onClick={() => handleApprove(driver.id, driver.name)}
                  style={{ flex: 1, padding: '8px', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  <Check size={16} /> Aprobar
                </button>
                <button 
                  onClick={() => handleReject(driver.id, driver.name)}
                  style={{ flex: 1, padding: '8px', background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  <X size={16} /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriversAdmin;
