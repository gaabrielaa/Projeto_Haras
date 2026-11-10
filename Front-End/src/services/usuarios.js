import { requisicao } from './api';

export function listarUsuarios() {
  return requisicao('/usuarios');
}

export function cadastrarUsuario(dados) {
  return requisicao('/usuarios', 'POST', dados);
}

export function editarUsuario(id, dados) {
  return requisicao('/usuarios/' + id, 'PUT', dados);
}

export function excluirUsuario(id) {
  return requisicao('/usuarios/' + id, 'DELETE');
}