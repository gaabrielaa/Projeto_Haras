import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import {
  listarServicos,
  cadastrarServico,
  editarServico,
  excluirServico,
} from '../services/servicos';

const FORM_VAZIO = { nome_servico: '', preco: '' };

// O preço vem do banco como "80.50" e é mostrado como R$ 80,50
function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
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
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function abrirEdicao(servico) {
    setEditandoId(servico.id);
    setForm({
      nome_servico: servico.nome_servico,
      preco: String(servico.preco).replace('.', ','),
    });
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

    // Validação no front-end (o back-end valida de novo)
    if (form.nome_servico.trim() === '') {
      setErroForm('Informe o nome do serviço.');
      return;
    }

    const preco = form.preco.trim().replace(',', '.');
    if (preco === '' || isNaN(preco)) {
      setErroForm('Informe um preço válido.');
      return;
    }
    if (Number(preco) < 0) {
      setErroForm('O preço não pode ser negativo.');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId === null) {
        await cadastrarServico(form);
        setMensagem('Serviço cadastrado.');
      } else {
        await editarServico(editandoId, form);
        setMensagem('Serviço atualizado.');
      }
      setModalAberto(false);
      await carregar();
    } catch (erroApi) {
      setErroForm(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(servico) {
    if (!window.confirm('Excluir o serviço ' + servico.nome_servico + '?')) {
      return;
    }
    setMensagem('');
    try {
      await excluirServico(servico.id);
      setMensagem('Serviço excluído.');
      await carregar();
    } catch (erroApi) {
      // Ex.: serviço que já tem agendamentos não pode ser excluído
      setErro(erroApi.message);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Serviços</h1>
        <button className="botao" onClick={abrirNovo}>Novo serviço</button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}

      <div className="tabela-area">
        <table className="tabela">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 && (
              <tr>
                <td colSpan="3" className="tabela-vazia">Nenhum serviço cadastrado.</td>
              </tr>
            )}
            {servicos.map((s) => (
              <tr key={s.id}>
                <td>{s.nome_servico}</td>
                <td>{formatarPreco(s.preco)}</td>
                <td>
                  <div className="acoes">
                    <button className="botao botao-pequeno botao-claro" onClick={() => abrirEdicao(s)}>
                      Editar
                    </button>
                    <button className="botao botao-pequeno botao-perigo" onClick={() => excluir(s)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal
          titulo={editandoId === null ? 'Novo serviço' : 'Editar serviço'}
          aoFechar={() => setModalAberto(false)}
        >
          {erroForm && <div className="mensagem-erro">{erroForm}</div>}

          <form onSubmit={salvar}>
            <div className="campo">
              <label htmlFor="nome_servico">Nome do serviço</label>
              <input
                id="nome_servico"
                name="nome_servico"
                type="text"
                value={form.nome_servico}
                onChange={mudarCampo}
              />
            </div>
            <div className="campo">
              <label htmlFor="preco">Preço (R$)</label>
              <input
                id="preco"
                name="preco"
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 80,50"
                value={form.preco}
                onChange={mudarCampo}
              />
            </div>

            <div className="modal-botoes">
              <button className="botao botao-claro" type="button" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button className="botao" type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Servicos;