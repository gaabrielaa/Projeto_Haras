import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { limparSessao } from '../services/api';

function Layout() {
  const navigate = useNavigate();

  function sair() {
    limparSessao();
    navigate('/login');
  }

  return (
    <div className="app">
      <nav className="menu-lateral">
        <div className="logo">Haras</div>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/cavalos">Cavalos</NavLink>
        <NavLink to="/baias">Baias</NavLink>
        <NavLink to="/proprietarios">Proprietários</NavLink>
        <button className="menu-sair" onClick={sair}>Sair</button>
      </nav>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;