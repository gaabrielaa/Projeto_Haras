import { requisicao } from './api';

export function listarBaias() {
  return requisicao('/baias');
}

export function cadastrarBaia(dados) {
  return requisicao('/baias', 'POST', dados);
}

export function editarBaia(id, dados) {
  return requisicao('/baias/' + id, 'PUT', dados);
}