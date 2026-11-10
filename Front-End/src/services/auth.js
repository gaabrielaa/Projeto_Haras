import { requisicao, guardarSessao } from './api';

// Faz o login e guarda o token no navegador
export async function fazerLogin(email, senha) {
  const resposta = await requisicao('/auth/login', 'POST', { email, senha });
  guardarSessao(resposta.token, resposta.usuario);
}