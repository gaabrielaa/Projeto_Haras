import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { listarBaias, cadastrarBaia, editarBaia } from '../services/baias';

const FORM_VAZIO = { numero_baia: '', tamanho: '' };

function Baias() {
  const [baias, setBaias] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setBaias(await listarBaias());
      setErro('');
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNova() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function abrirEdicao(baia) {
    setEditandoId(baia.id);
    setForm({ numero_baia: String(baia.numero_baia), tamanho: baia.tamanho || '' });
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

    if (!/^[1-9]\d*$/.test(form.numero_baia)) {
      setErroForm('Informe um número de baia válido (maior que zero).');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId === null) {
        await cadastrarBaia(form);
        setMensagem('Baia cadastrada.');
      } else {
        await editarBaia(editandoId, form);
        setMensagem('Baia atualizada.');
      }
      setModalAberto(false);
      await carregar();
    } catch (erroApi) {
      setErroForm(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Baias</h1>
        <button className="botao" onClick={abrirNova}>Nova baia</button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}

      <div className="tabela-area">
        <table className="tabela">
          <thead>
            <tr>
              <th>Baia</th>
              <th>Tamanho</th>
              <th>Status</th>
              <th>Cavalo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {baias.length === 0 && (
              <tr>
                <td colSpan="5" className="tabela-vazia">Nenhuma baia cadastrada.</td>
              </tr>
            )}
            {baias.map((b) => (
              <tr key={b.id}>
                <td>{b.numero_baia}</td>
                <td>{b.tamanho || '-'}</td>
                <td>
                  {b.status === 'livre' ? (
                    <span className="badge badge-livre">Livre</span>
                  ) : (
                    <span className="badge badge-ocupada">Ocupada</span>
                  )}
                </td>
                <td>{b.cavalo_nome || '-'}</td>
                <td>
                  <button className="botao botao-pequeno botao-claro" onClick={() => abrirEdicao(b)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal
          titulo={editandoId === null ? 'Nova baia' : 'Editar baia'}
          aoFechar={() => setModalAberto(false)}
        >
          {erroForm && <div className="mensagem-erro">{erroForm}</div>}

          <form onSubmit={salvar}>
            <div className="campo">
              <label htmlFor="numero_baia">Número da baia</label>
              <input
                id="numero_baia"
                name="numero_baia"
                type="number"
                min="1"
                value={form.numero_baia}
                onChange={mudarCampo}
              />
            </div>
            <div className="campo">
              <label htmlFor="tamanho">Tamanho</label>
              <input
                id="tamanho"
                name="tamanho"
                type="text"
                placeholder="Ex.: 3x3 m"
                value={form.tamanho}
                onChange={mudarCampo}
              />
            </div>

            <p className="dica">O status (livre ou ocupada) muda sozinho quando um cavalo entra ou sai da baia.</p>

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

export default Baias;