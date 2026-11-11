import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import {
  listarAgendamentos,
  cadastrarAgendamento,
  cancelarAgendamento,
} from '../services/agendamentos';
import { listarCavalos } from '../services/cavalos';
import { listarServicos } from '../services/servicos';

const FORM_VAZIO = { cavalo_id: '', servico_id: '', data_agendamento: '' };

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// O banco devolve 2026-11-20 14:30:00 e a tela mostra 20/11/2026 às 14:30
function formatarDataHora(texto) {
  if (!texto) return '-';
  const [data, hora] = texto.split(' ');
  const [ano, mes, dia] = data.split('-');
  return dia + '/' + mes + '/' + ano + ' às ' + hora.slice(0, 5);
}

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [cavalos, setCavalos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setAgendamentos(await listarAgendamentos());
      setCavalos(await listarCavalos());
      setServicos(await listarServicos());
      setErro('');
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setForm(FORM_VAZIO);
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function mudarCampo(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroForm('');

    if (form.cavalo_id === '') {
      setErroForm('Selecione o cavalo.');
      return;
    }
    if (form.servico_id === '') {
      setErroForm('Selecione o serviço.');
      return;
    }
    if (form.data_agendamento === '') {
      setErroForm('Informe a data e o horário.');
      return;
    }

    setSalvando(true);
    try {
      await cadastrarAgendamento(form);
      setMensagem('Agendamento confirmado.');
      setModalAberto(false);
      await carregar();
    } catch (erroApi) {
      setErroForm(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  async function cancelar(agendamento) {
    const aviso =
      'Cancelar o agendamento de ' + agendamento.servico_nome + ' para ' + agendamento.cavalo_nome +
      ' em ' + formatarDataHora(agendamento.data_agendamento) + '?';
    if (!window.confirm(aviso)) {
      return;
    }
    setMensagem('');
    try {
      await cancelarAgendamento(agendamento.id);
      setMensagem('Agendamento cancelado.');
      await carregar();
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Agendamentos</h1>
        <button className="botao" onClick={abrirNovo}>Novo agendamento</button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}

      <div className="tabela-area">
        <table className="tabela">
          <thead>
            <tr>
              <th>Data e horário</th>
              <th>Cavalo</th>
              <th>Proprietário</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 && (
              <tr>
                <td colSpan="6" className="tabela-vazia">Nenhum agendamento cadastrado.</td>
              </tr>
            )}
            {agendamentos.map((a) => (
              <tr key={a.id}>
                <td>{formatarDataHora(a.data_agendamento)}</td>
                <td>{a.cavalo_nome}</td>
                <td>{a.proprietario_nome}</td>
                <td>{a.servico_nome}</td>
                <td>{formatarPreco(a.preco)}</td>
                <td>
                  <button className="botao botao-pequeno botao-perigo" onClick={() => cancelar(a)}>
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal titulo="Novo agendamento" aoFechar={() => setModalAberto(false)}>
          {erroForm && <div className="mensagem-erro">{erroForm}</div>}

          <form onSubmit={salvar}>
            <div className="campo">
              <label htmlFor="cavalo_id">Cavalo</label>
              <select id="cavalo_id" name="cavalo_id" value={form.cavalo_id} onChange={mudarCampo}>
                <option value="">Selecione...</option>
                {cavalos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.proprietario_nome})
                  </option>
                ))}
              </select>
              {cavalos.length === 0 && (
                <p className="dica">Cadastre um cavalo antes de fazer agendamentos.</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="servico_id">Serviço</label>
              <select id="servico_id" name="servico_id" value={form.servico_id} onChange={mudarCampo}>
                <option value="">Selecione...</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome_servico} - {formatarPreco(s.preco)}
                  </option>
                ))}
              </select>
              {servicos.length === 0 && (
                <p className="dica">Cadastre um serviço antes de fazer agendamentos.</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="data_agendamento">Data e horário</label>
              <input
                id="data_agendamento"
                name="data_agendamento"
                type="datetime-local"
                value={form.data_agendamento}
                onChange={mudarCampo}
              />
            </div>

            <div className="modal-botoes">
              <button className="botao botao-claro" type="button" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button className="botao" type="submit" disabled={salvando}>
                {salvando ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Agendamentos;