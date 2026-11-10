import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { listarCavalos, cadastrarCavalo, editarCavalo, excluirCavalo } from '../services/cavalos';
import { listarUsuarios } from '../services/usuarios';
import { listarBaias } from '../services/baias';

const FORM_VAZIO = { nome: '', raca: '', data_nascimento: '', proprietario_id: '', baia_id: '' };

// A data vem do banco como 2018-05-10 e é mostrada como 10/05/2018
function formatarData(data) {
  if (!data) return '-';
  const [ano, mes, dia] = data.split('-');
  return dia + '/' + mes + '/' + ano;
}

function Cavalos() {
  const [cavalos, setCavalos] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);
  const [baias, setBaias] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [baiaOriginal, setBaiaOriginal] = useState(''); // baia que o cavalo já ocupa
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [visualizando, setVisualizando] = useState(null);

  async function carregar() {
    try {
      setCavalos(await listarCavalos());
      setProprietarios(await listarUsuarios());
      setBaias(await listarBaias());
      setErro('');
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // Só baias livres podem ser escolhidas (mais a baia atual do cavalo, ao editar).
  // Os ids vêm como texto da API, por isso a comparação com String().
  const baiasDisponiveis = baias.filter(
    (b) => b.status === 'livre' || String(b.id) === baiaOriginal
  );

  function abrirNovo() {
    setEditandoId(null);
    setBaiaOriginal('');
    setForm(FORM_VAZIO);
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function abrirEdicao(cavalo) {
    const baiaAtual = cavalo.baia_id ? String(cavalo.baia_id) : '';
    setEditandoId(cavalo.id);
    setBaiaOriginal(baiaAtual);
    setForm({
      nome: cavalo.nome,
      raca: cavalo.raca || '',
      data_nascimento: cavalo.data_nascimento || '',
      proprietario_id: String(cavalo.proprietario_id),
      baia_id: baiaAtual,
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

    if (form.nome.trim() === '') {
      setErroForm('Informe o nome do cavalo.');
      return;
    }
    if (form.proprietario_id === '') {
      setErroForm('Selecione o proprietário.');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId === null) {
        await cadastrarCavalo(form);
        setMensagem('Cavalo cadastrado.');
      } else {
        await editarCavalo(editandoId, form);
        setMensagem('Cavalo atualizado.');
      }
      setModalAberto(false);
      await carregar(); // recarrega também as baias, que mudam de status
    } catch (erroApi) {
      setErroForm(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(cavalo) {
    const aviso =
      'Excluir o cavalo ' + cavalo.nome + '? A baia dele será liberada e os agendamentos dele serão removidos.';
    if (!window.confirm(aviso)) {
      return;
    }
    setMensagem('');
    try {
      await excluirCavalo(cavalo.id);
      setMensagem('Cavalo excluído.');
      await carregar();
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Cavalos</h1>
        <button className="botao" onClick={abrirNovo}>Novo cavalo</button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}

      <div className="tabela-area">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Proprietário</th>
              <th>Baia</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cavalos.length === 0 && (
              <tr>
                <td colSpan="5" className="tabela-vazia">Nenhum cavalo cadastrado.</td>
              </tr>
            )}
            {cavalos.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.raca || '-'}</td>
                <td>{c.proprietario_nome}</td>
                <td>{c.numero_baia ? 'Baia ' + c.numero_baia : 'Sem baia'}</td>
                <td>
                  <div className="acoes">
                    <button className="botao botao-pequeno botao-claro" onClick={() => setVisualizando(c)}>
                      Ver
                    </button>
                    <button className="botao botao-pequeno botao-claro" onClick={() => abrirEdicao(c)}>
                      Editar
                    </button>
                    <button className="botao botao-pequeno botao-perigo" onClick={() => excluir(c)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visualizar informações */}
      {visualizando && (
        <Modal titulo={visualizando.nome} aoFechar={() => setVisualizando(null)}>
          <dl className="detalhes">
            <dt>Raça</dt>
            <dd>{visualizando.raca || '-'}</dd>
            <dt>Data de nascimento</dt>
            <dd>{formatarData(visualizando.data_nascimento)}</dd>
            <dt>Proprietário</dt>
            <dd>{visualizando.proprietario_nome}</dd>
            <dt>Baia</dt>
            <dd>{visualizando.numero_baia ? 'Baia ' + visualizando.numero_baia : 'Sem baia'}</dd>
          </dl>
          <div className="modal-botoes">
            <button className="botao botao-claro" onClick={() => setVisualizando(null)}>Fechar</button>
          </div>
        </Modal>
      )}

      {/* Cadastrar / editar */}
      {modalAberto && (
        <Modal
          titulo={editandoId === null ? 'Novo cavalo' : 'Editar cavalo'}
          aoFechar={() => setModalAberto(false)}
        >
          {erroForm && <div className="mensagem-erro">{erroForm}</div>}

          <form onSubmit={salvar}>
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="nome" type="text" value={form.nome} onChange={mudarCampo} />
            </div>
            <div className="campo">
              <label htmlFor="raca">Raça</label>
              <input id="raca" name="raca" type="text" value={form.raca} onChange={mudarCampo} />
            </div>
            <div className="campo">
              <label htmlFor="data_nascimento">Data de nascimento</label>
              <input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                value={form.data_nascimento}
                onChange={mudarCampo}
              />
            </div>
            <div className="campo">
              <label htmlFor="proprietario_id">Proprietário</label>
              <select
                id="proprietario_id"
                name="proprietario_id"
                value={form.proprietario_id}
                onChange={mudarCampo}
              >
                <option value="">Selecione...</option>
                {proprietarios.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {proprietarios.length === 0 && (
                <p className="dica">Cadastre um proprietário antes de cadastrar cavalos.</p>
              )}
            </div>
            <div className="campo">
              <label htmlFor="baia_id">Baia</label>
              <select id="baia_id" name="baia_id" value={form.baia_id} onChange={mudarCampo}>
                <option value="">Sem baia</option>
                {baiasDisponiveis.map((b) => (
                  <option key={b.id} value={b.id}>
                    Baia {b.numero_baia}{b.tamanho ? ' (' + b.tamanho + ')' : ''}
                  </option>
                ))}
              </select>
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

export default Cavalos;