import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario,
} from '../services/usuarios';

const FORM_VAZIO = { nome: '', email: '', telefone: '', senha: '' };

function Proprietarios() {
  const [proprietarios, setProprietarios] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = cadastro novo
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setProprietarios(await listarUsuarios());
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

  function abrirEdicao(proprietario) {
    setEditandoId(proprietario.id);
    setForm({
      nome: proprietario.nome,
      email: proprietario.email,
      telefone: proprietario.telefone || '',
      senha: '', // em branco = mantém a senha atual
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
    if (form.nome.trim() === '') {
      setErroForm('Informe o nome.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setErroForm('Digite um e-mail válido.');
      return;
    }
    const criando = editandoId === null;
    if ((criando || form.senha !== '') && form.senha.length < 6) {
      setErroForm('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      if (criando) {
        await cadastrarUsuario(form);
        setMensagem('Proprietário cadastrado.');
      } else {
        await editarUsuario(editandoId, form);
        setMensagem('Proprietário atualizado.');
      }
      setModalAberto(false);
      await carregar();
    } catch (erroApi) {
      setErroForm(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(proprietario) {
    if (!window.confirm('Excluir o proprietário ' + proprietario.nome + '?')) {
      return;
    }
    setMensagem('');
    try {
      await excluirUsuario(proprietario.id);
      setMensagem('Proprietário excluído.');
      await carregar();
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Proprietários</h1>
        <button className="botao" onClick={abrirNovo}>Novo proprietário</button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}

      <div className="tabela-area">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {proprietarios.length === 0 && (
              <tr>
                <td colSpan="4" className="tabela-vazia">Nenhum proprietário cadastrado.</td>
              </tr>
            )}
            {proprietarios.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td>{p.telefone || '-'}</td>
                <td>
                  <div className="acoes">
                    <button className="botao botao-pequeno botao-claro" onClick={() => abrirEdicao(p)}>
                      Editar
                    </button>
                    <button className="botao botao-pequeno botao-perigo" onClick={() => excluir(p)}>
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
          titulo={editandoId === null ? 'Novo proprietário' : 'Editar proprietário'}
          aoFechar={() => setModalAberto(false)}
        >
          {erroForm && <div className="mensagem-erro">{erroForm}</div>}

          <form onSubmit={salvar}>
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="nome" type="text" value={form.nome} onChange={mudarCampo} />
            </div>
            <div className="campo">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="text" value={form.email} onChange={mudarCampo} />
            </div>
            <div className="campo">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" name="telefone" type="text" value={form.telefone} onChange={mudarCampo} />
            </div>
            <div className="campo">
              <label htmlFor="senha">
                {editandoId === null ? 'Senha' : 'Nova senha (deixe em branco para manter)'}
              </label>
              <input id="senha" name="senha" type="password" value={form.senha} onChange={mudarCampo} />
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

export default Proprietarios;