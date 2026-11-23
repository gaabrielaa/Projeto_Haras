// todas as chamadas da API passam por aqui
const URL_BASE = '/api';

export function pegarToken() {
  return localStorage.getItem('token');
}

export function guardarSessao(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export async function requisicao(caminho, metodo = 'GET', dados = null) {
  const opcoes = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
  };

  // se estiver logado, envia o token em todas as requisições
  const token = pegarToken();
  if (token) {
    opcoes.headers.Authorization = 'Bearer ' + token;
  }

  if (dados) {
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(URL_BASE + caminho, opcoes);
  const corpo = await resposta.json().catch(() => ({}));

  // token vencido ou inválido, volta para o login
  if (resposta.status === 401 && token && caminho !== '/auth/login') {
    limparSessao();
    window.location.href = '/login';
  }

  if (!resposta.ok) {
    throw new Error(corpo.erro || 'Não foi possível comunicar com o servidor.');
  }

  return corpo;
}