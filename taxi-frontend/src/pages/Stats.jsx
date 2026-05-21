import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const SERVER = "http://localhost:3000";

const Stats = () => {
  const { token } = useAuth();
  
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [rHourly, rWeekly] = await Promise.all([
        fetch(`${SERVER}/stats/hourly`, { headers }),
        fetch(`${SERVER}/stats/weekly`, { headers })
      ]);

      if (rHourly.ok && rWeekly.ok) {
        const hourly = await rHourly.json();
        const weekly = await rWeekly.json();
        setHourlyData(hourly);
        setWeeklyData(weekly);
      }
    } catch (e) {
      console.error("Error al cargar estadísticas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Estadísticas y Analítica de Demanda</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Gráficos analíticos generados automáticamente a partir de las inferencias almacenadas.
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchStats} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'dot' : ''} style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} />
          {loading ? "Cargando..." : "Recargar Datos"}
        </button>
      </div>

      {loading ? (
        <div className="card">
          <div className="empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
            <RefreshCw size={32} className="dot" style={{ animation: 'spin 2s linear infinite', color: 'var(--accent)' }} />
            <span>Analizando registros de Firebase Firestore...</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Gráfico 1: Demanda Horaria (T4-1) */}
          <div className="card">
            <div className="card-title">
              <Clock size={16} style={{ color: 'var(--accent)' }} />
              <span>Promedio de pasajeros por hora del día (Horas Pico)</span>
            </div>
            <div style={{ height: 320, width: '100%', marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="hourlyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="hora" 
                    stroke="var(--muted)" 
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    allowDecimals={true}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(18, 25, 41, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--text)',
                      fontFamily: 'Space Grotesk'
                    }}
                    labelStyle={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="personas" 
                    name="Pasajeros Promedio"
                    stroke="#3b82f6" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#hourlyGlow)" 
                    dot={{ fill: 'var(--bg)', stroke: '#3b82f6', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent2)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
              Muestra las horas con mayor afluencia de pasajeros en la parada (escala de 00:00 a 23:00).
            </p>
          </div>

          {/* Gráfico 2: Demanda Semanal (T4-2) */}
          <div className="card">
            <div className="card-title">
              <Calendar size={16} style={{ color: 'var(--green)' }} />
              <span>Promedio de pasajeros según el día de la semana</span>
            </div>
            <div style={{ height: 320, width: '100%', marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="weeklyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="dia" 
                    stroke="var(--muted)" 
                    tick={{ fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    allowDecimals={true}
                  />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ 
                      background: 'rgba(18, 25, 41, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--text)',
                      fontFamily: 'Space Grotesk'
                    }}
                    labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
                  />
                  <Bar 
                    dataKey="personas" 
                    name="Pasajeros Promedio"
                    fill="url(#weeklyGlow)" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
              Facilita identificar qué días de la semana la cooperativa de taxis requiere asignar más unidades de servicio.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default Stats;
