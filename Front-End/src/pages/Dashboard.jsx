import { useEffect, useState } from 'react';
import { carregarDashboard } from '../services/dashboard';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// O banco devolve 2026-11-20 14:30:00. Aqui vira { dia: '20', mes: 'nov', hora: '14:30' }
function separarDataHora(texto) {
  const [data, hora] = texto.split(' ');
  const [, mes, dia] = data.split('-');
  return { dia: dia, mes: MESES[Number(mes) - 1], hora: hora.slice(0, 5) };
}

// Ex.: "Quarta-feira, 11 de novembro de 2026"
function dataDeHoje() {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  // Nome do usuário guardado no login
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    carregarDashboard()
      .then(setDados)
      .catch((erroApi) => setErro(erroApi.message));
  }, []);

  return (
    <div>
      <div className="dash-topo">
        <h1>Olá{usuario.nome ? ', ' + usuario.nome : ''}!</h1>
        <p>{dataDeHoje()}</p>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      {dados && (
        <div className="dash-grade">
          {/* Cartões, um embaixo do outro */}
          <div className="dash-lateral">
            <div className="cartao">
              <div className="cartao-numero">{dados.total_cavalos}</div>
              <div className="cartao-legenda">Cavalos cadastrados</div>
            </div>
            <div className="cartao">
              <div className="cartao-numero">{dados.total_baias}</div>
              <div className="cartao-legenda">Total de baias</div>
            </div>
            <div className="cartao">
              <div className="cartao-numero">{dados.baias_ocupadas}</div>
              <div className="cartao-legenda">Baias ocupadas</div>
            </div>
            <div className="cartao cartao-verde">
              <div className="cartao-numero">{dados.baias_livres}</div>
              <div className="cartao-legenda">Baias disponíveis</div>
            </div>
            <div className="cartao">
              <div className="cartao-numero">{dados.total_servicos}</div>
              <div className="cartao-legenda">Serviços cadastrados</div>
            </div>
          </div>

          {/* Agendamentos recentes */}
          <div>
            <h2 className="subtitulo">Agendamentos recentes</h2>
            <div className="agenda-lista">
              {dados.agendamentos_recentes.length === 0 && (
                <div className="agenda-vazia">Nenhum agendamento cadastrado.</div>
              )}
              {dados.agendamentos_recentes.map((a) => {
                const quando = separarDataHora(a.data_agendamento);
                return (
                  <div className="agenda-item" key={a.id}>
                    <div className="agenda-data">
                      <div className="agenda-dia">{quando.dia}</div>
                      <div className="agenda-mes">{quando.mes}</div>
                    </div>
                    <div className="agenda-texto">
                      <div className="agenda-titulo">{a.servico_nome}</div>
                      <div className="agenda-detalhe">
                        {a.cavalo_nome} · {quando.hora}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;