import { useEffect, useState } from 'react';
import { requisicao } from '../services/api';

function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState('');

  // Busca o usuário logado na API (rota protegida, exige o token)
  useEffect(() => {
    requisicao('/auth/eu')
      .then(setUsuario)
      .catch((erroApi) => setErro(erroApi.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {erro && <div className="mensagem-erro">{erro}</div>}
      {usuario && <p>Olá, {usuario.nome}.</p>}
    </div>
  );
}

export default Dashboard;