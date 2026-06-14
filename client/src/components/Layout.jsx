import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const NAV = {
  admin: [
    ['/admin',              '◧ Panel general'],
    ['/admin/users',        '◉ Usuarios & KYC'],
    ['/admin/documents',    '▤ Documentos'],
    ['/admin/scoring',      '◴ Motor de scoring'],
    ['/admin/traceability', '≣ Trazabilidad'],
    ['/admin/nfts',         '★ NFTs en ETTIOS'],
  ],
  verificador: [
    ['/verificador',         '◧ Mi panel'],
    ['/verificador/queue',   '▤ Cola de validación'],
    ['/verificador/history', '✓ Mis dictámenes'],
  ],
  usuario: [
    ['/u',             '◧ Mi panel'],
    ['/u/documents',   '▤ Mis documentos'],
    ['/u/upload',      '＋ Cargar documento'],
    ['/u/reputation',  '◴ Mi reputación'],
    ['/u/kyc',         '⚖ Verificar identidad'],
  ],
};

function scoreClass(s) {
  if (s >= 80) return 'good';
  if (s >= 55) return 'mid';
  if (s >= 30) return 'low';
  return 'risk';
}
function scoreLabel(s) {
  if (s >= 80) return 'Confianza alta';
  if (s >= 55) return 'Confianza media';
  if (s >= 30) return 'Confianza baja';
  return 'Riesgo';
}

export default function Layout() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = NAV[user.role] || NAV.usuario;
  const sc = Number(user.reputation || 0);

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="brand-mark">M<span>T</span>P</div>
          <div>
            <strong>MTP Platform</strong>
            <small>Economía verificable</small>
          </div>
        </Link>
        <nav className="nav">
          {items.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/admin' || to === '/verificador' || to === '/u'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="role-tag">{user.role}</div>
          <button className="logout" onClick={logout}>Cerrar sesión →</button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <h1>Hola, {user.full_name.split(' ')[0]}</h1>
            <p className="muted">Infraestructura de Validación Económica Verificable</p>
          </div>
          <div className="topbar-user">
            <div className={`score-pill score-${scoreClass(sc)}`}>
              <span className="score-num">{Math.round(sc)}</span>
              <span className="score-lbl">{scoreLabel(sc)}</span>
            </div>
            <div className="avatar">{user.full_name[0]?.toUpperCase()}</div>
            <div className="who">
              <strong>{user.full_name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
