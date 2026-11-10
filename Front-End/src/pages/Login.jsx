import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fazerLogin } from '../services/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');

    // Validação dos campos no front-end
    if (email.trim() === '' || senha === '') {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setCarregando(true);
    try {
      await fazerLogin(email.trim(), senha);
      navigate('/');
    } catch (erroLogin) {
      setErro(erroLogin.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-pagina">
      <div className="login-caixa">
        <h1>Haras</h1>
        <p className="login-subtitulo">Gestão de alojamento equino</p>

        {erro && <div className="mensagem-erro">{erro}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button className="botao botao-total" type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;