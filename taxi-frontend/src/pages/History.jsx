import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Download, 
  Calendar, 
  User, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RefreshCw 
} from 'lucide-react';

const SERVER = "http://localhost:3000";

const History = () => {
  const { token } = useAuth();
  
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alertFilter, setAlertFilter] = useState('todos'); // 'todos', 'urgente', 'preventiva', 'normal'

  const fetchFilteredData = async (targetPage = page) => {
    setLoading(true);
    try {
      let url = `${SERVER}/detecciones/filtradas?page=${targetPage}&limit=${limit}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const r = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!r.ok) throw new Error();
      const res = await r.json();

      // Aplicar filtro de estado de alerta en el cliente si es necesario
      let filtered = res.data;
      if (alertFilter !== 'todos') {
        filtered = res.data.filter(r => r.estado_alerta.toLowerCase() === alertFilter);
      }

      setData(filtered);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error("Error al obtener historial:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredData(1);
    setPage(1);
  }, [startDate, endDate, alertFilter, token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchFilteredData(newPage);
    }
  };

  // Exportar a CSV (T6-1)
  const exportToCSV = async () => {
    try {
      // Obtener todos los registros que coincidan con la fecha (sin paginación, con límite alto)
      let url = `${SERVER}/detecciones/filtradas?page=1&limit=2000`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const r = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!r.ok) throw new Error();
      const res = await r.json();

      let exportData = res.data;
      if (alertFilter !== 'todos') {
        exportData = res.data.filter(r => r.estado_alerta.toLowerCase() === alertFilter);
      }

      if (exportData.length === 0) {
        alert('No hay datos para exportar con los filtros actuales.');
        return;
      }

      // Metadatos del Reporte
      const empresa = "COMPAÑÍA DE TRANSPORTE EN TAXIS TAXIBOCARCHI CIA. S.A.";
      const reporte = "Reporte Histórico de Detecciones";
      const fechaEmision = new Date().toLocaleString();

      const metadataRows = [
        [`"${empresa}"`],
        [`"${reporte}"`],
        [`"Fecha de Emisión: ${fechaEmision}"`],
        [] // Fila vacía de separación
      ];

      // Estructurar el CSV
      const headers = ['ID', 'Timestamp', 'Personas', 'Estado Alerta', 'Alerta Enviada (Telegram)', 'Anti-Spam Activo'];
      const rows = exportData.map(d => [
        d.id,
        d.timestamp,
        d.personas,
        d.estado_alerta,
        d.alerta_enviada ? 'SI' : 'NO',
        d.anti_spam_activo ? 'SI' : 'NO'
      ]);

      const allRows = [...metadataRows, headers, ...rows];

      // Añadimos \uFEFF para que Excel reconozca correctamente la codificación UTF-8 (Tildes y Ñ)
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + allRows.map(e => e.join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TaxiBocarchi_Historial_${startDate || 'todas'}_a_${endDate || 'hoy'}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error al exportar CSV:', e);
      alert('Hubo un error al exportar el archivo CSV.');
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Historial de Detecciones</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Consulta y filtra todos los registros históricos guardados en Firebase Firestore.
          </p>
        </div>
        <button 
          onClick={exportToCSV} 
          className="refresh-btn" 
          style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: 'var(--accent2)' }}
        >
          <Download size={14} />
          Exportar a CSV
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          <Filter size={15} style={{ color: 'var(--accent)' }} />
          <span>Filtros de Búsqueda</span>
        </div>
        <div className="filter-bar">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Desde</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hasta</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Estado de Alerta</label>
            <select
              className="form-input"
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              style={{ paddingRight: 30 }}
            >
              <option value="todos">Todos los Estados</option>
              <option value="urgente">Urgente (Rojo)</option>
              <option value="preventiva">Preventiva (Amarillo)</option>
              <option value="normal">Normal (Verde)</option>
            </select>
          </div>
          <button 
            className="refresh-btn" 
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setAlertFilter('todos');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="card">
        <div className="card-title">Registros ({total} en total)</div>
        
        {loading ? (
          <div className="empty">
            <RefreshCw size={20} className="dot" style={{ animation: 'spin 2s linear infinite', color: 'var(--accent)' }} />
            <span style={{ marginLeft: 10 }}>Buscando datos en Firestore...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="empty">No se encontraron detecciones para los filtros aplicados.</div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Cant. Personas</th>
                  <th>Estado</th>
                  <th>Telegram</th>
                  <th>Anti-Spam</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  let badgeClass = 'badge-green';
                  if (r.estado_alerta === 'Urgente') badgeClass = 'badge-red';
                  if (r.estado_alerta === 'Preventiva') badgeClass = 'badge-amber';

                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>{r.timestamp}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 15 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User size={13} style={{ color: 'var(--muted)' }} />
                          {r.personas}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{r.estado_alerta}</span>
                      </td>
                      <td>
                        {r.alerta_enviada ? (
                          <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            Enviada
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        {r.anti_spam_activo ? (
                          <span style={{ color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            <AlertTriangle size={13} />
                            Activo (Ignorado)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination">
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
                Página {page} de {totalPages || 1}
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Siguiente
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
