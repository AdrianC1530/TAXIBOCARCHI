import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Activity, 
  Clock, 
  Bell, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  User 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const SERVER = "http://localhost:3000";

function getAlertState(n) {
  if (n === 0) return { 
    cls: "alert-ok", 
    icon: <CheckCircle2 size={16} />, 
    msg: "Sin pasajeros — parada libre" 
  };
  if (n < 3) return { 
    cls: "alert-ok", 
    icon: <CheckCircle2 size={16} />, 
    msg: `${n} pasajero${n > 1 ? 's' : ''} — nivel normal` 
  };
  if (n === 3) return { 
    cls: "alert-watch", 
    icon: <AlertTriangle size={16} />, 
    msg: "3 pasajeros — próximo al umbral" 
  };
  return { 
    cls: "alert-urgent", 
    icon: <AlertCircle size={16} />, 
    msg: `${n} pasajeros — alerta enviada a Telegram` 
  };
}

function getCountColor(n) {
  if (n === 0) return "var(--muted)";
  if (n < 3)   return "var(--green)";
  if (n === 3)  return "var(--amber)";
  return "var(--red)";
}

function getBadge(n) {
  if (n === 0) return { cls: "badge-blue", txt: "Vacío" };
  if (n < 3)   return { cls: "badge-green", txt: "Normal" };
  if (n === 3)  return { cls: "badge-amber", txt: "Atención" };
  return { cls: "badge-red", txt: "Urgente" };
}

const Dashboard = () => {
  const { token } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [ultimo, setUltimo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverOk, setServerOk] = useState(false);
  const [ahora, setAhora] = useState(new Date());

  const fetchData = async () => {
    try {
      const r = await fetch(`${SERVER}/detecciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setRegistros(data);
      if (data.length > 0) {
        setUltimo(data[data.length - 1]);
      }
      setServerOk(true);
    } catch {
      setServerOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Configurar polling de 3 segundos para el Dashboard en tiempo real (T2-3)
    const iv = setInterval(fetchData, 3000);
    const clock = setInterval(() => setAhora(new Date()), 1000);
    return () => { clearInterval(iv); clearInterval(clock); };
  }, [token]);

  const totalAlertas = registros.filter(r => r.alerta_enviada).length;
  const promedio     = registros.length > 0
    ? (registros.reduce((a, r) => a + r.personas, 0) / registros.length).toFixed(1)
    : "—";

  const personasActuales = ultimo?.personas ?? 0;
  const alertState = getAlertState(personasActuales);
  const badge = getBadge(personasActuales);

  // Datos para el gráfico de tendencia en tiempo real (últimos 15 registros)
  const chartData = [...registros]
    .slice(-15)
    .map(r => ({
      // Extrae la hora HH:MM:SS del timestamp
      time: r.timestamp.slice(11, 19),
      personas: r.personas
    }));

  const maxIcons = 5;
  const activeColorClass = personasActuales >= 4 ? 'red' : (personasActuales === 3 ? 'amber' : 'green');

  return (
    <div className="page-content">
      {/* Header Sección */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Monitoreo en Tiempo Real</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {ahora.toLocaleDateString("es-EC", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {ahora.toLocaleTimeString("es-EC")}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-dot">
            <div className="dot" style={{ 
              background: serverOk ? "var(--green)" : "var(--red)", 
              boxShadow: `0 0 10px ${serverOk ? "var(--green-glow)" : "var(--red-glow)"}` 
            }} />
            {serverOk ? "Sincronizado en tiempo real (3s)" : "Sin Conexión"}
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid-top">
        {/* Card 1: Personas Ahora */}
        <div className="card">
          <div className="metric-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Personas ahora</span>
            <Users size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="big-counter">
            <div className="big-num" style={{ color: getCountColor(personasActuales) }}>
              {loading ? "—" : personasActuales}
            </div>
            <div className="big-label">en la parada</div>
          </div>
          
          {/* Visualizador interactivo de cola */}
          {!loading && (
            <div className="queue-visualizer">
              {Array.from({ length: maxIcons }).map((_, i) => {
                const isActive = personasActuales > i;
                return (
                  <div 
                    key={i} 
                    className={`passenger-icon ${isActive ? `active ${activeColorClass}` : ''}`}
                    title={isActive ? `Pasajero ${i + 1} detectado` : `Lugar de espera ${i + 1}`}
                  >
                    <User size={26} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span style={{ fontSize: 8, marginTop: 4, fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                      P{i + 1}
                    </span>
                  </div>
                );
              })}
              {personasActuales > maxIcons && (
                <div style={{ 
                  color: 'var(--red)', 
                  fontWeight: 700, 
                  fontSize: 13, 
                  animation: 'pulse 1s infinite',
                  marginLeft: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  +{personasActuales - maxIcons}
                </div>
              )}
            </div>
          )}

          <div className={`alert-box ${alertState.cls}`}>
            <span>{alertState.icon}</span>
            <span>{alertState.msg}</span>
          </div>
        </div>

        {/* Card 2: Estadísticas del Turno */}
        <div className="card">
          <div className="metric-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Estadísticas</span>
            <Activity size={15} style={{ color: 'var(--accent2)' }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total detecciones</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{registros.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alertas Telegram</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: "var(--amber)" }}>{totalAlertas}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promedio de personas</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: "var(--accent2)" }}>{promedio}</div>
            </div>
          </div>
        </div>

        {/* Card 3: Última Detección */}
        <div className="card">
          <div className="metric-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Última detección</span>
            <Clock size={15} style={{ color: 'var(--green)' }} />
          </div>
          {ultimo ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "var(--text)", marginBottom: 16, fontWeight: 500 }}>
                {ultimo.timestamp}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personas detectadas</div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, color: getCountColor(ultimo.personas), marginBottom: 14 }}>
                {ultimo.personas}
              </div>
              <span className={`badge ${badge.cls}`}>● {badge.txt}</span>
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={12} style={{ color: ultimo.alerta_enviada ? 'var(--green)' : 'var(--muted)' }} />
                <span>Alerta Telegram:</span> 
                <span style={{ color: ultimo.alerta_enviada ? "var(--green)" : "var(--muted)", fontWeight: 600 }}>
                  {ultimo.alerta_enviada ? "✓ Enviada" : "— No enviada"}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty">{loading ? "Cargando..." : "Sin datos aún"}</div>
          )}
        </div>
      </div>

      {/* Sección Inferior: Gráfico de Tendencia y Feed de Eventos */}
      <div className="grid-bottom">
        {/* Gráfico en Tiempo Real */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <span>Tendencia en Tiempo Real (Últimas Lecturas)</span>
          </div>
          {registros.length > 0 ? (
            <div className="chart-wrap" style={{ marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="realtimeGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--muted)" 
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    allowDecimals={false}
                    domain={[0, 'dataMax + 2']}
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
                    name="Pasajeros"
                    stroke="var(--accent)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#realtimeGlow)"
                    dot={{ fill: 'var(--bg)', stroke: 'var(--accent)', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent2)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty">{loading ? "Cargando datos..." : "Sin datos de tendencia aún"}</div>
          )}
        </div>

        {/* Feed de Últimos Eventos */}
        <div className="card">
          <div className="card-title">
            <Activity size={16} style={{ color: 'var(--accent2)' }} />
            <span>Últimos eventos registrados</span>
          </div>
          <div className="feed" style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
            {registros.length === 0 && (
              <div className="empty">{loading ? "Cargando..." : "Sin registros de detecciones"}</div>
            )}
            {[...registros].reverse().slice(0, 10).map((r, i) => {
              const b = getBadge(r.personas);
              return (
                <div className="feed-item" key={r.id || i}>
                  <div className="feed-left">
                    <div className="feed-icon" style={{
                      background: r.personas >= 4 ? "var(--red-bg)" : (r.personas === 3 ? "var(--amber-bg)" : "var(--green-bg)"),
                      color: r.personas >= 4 ? "var(--red)" : (r.personas === 3 ? "var(--amber)" : "var(--green)")
                    }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.personas} persona{r.personas !== 1 ? "s" : ""}</div>
                      <div className="feed-time">{r.timestamp}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.alerta_enviada && (
                      <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                        Telegram
                      </span>
                    )}
                    <span className={`badge ${b.cls}`}>{b.txt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
