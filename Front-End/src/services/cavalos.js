import { requisicao } from './api';

export function listarCavalos() {
  return requisicao('/cavalos');
}

export function cadastrarCavalo(dados) {
  return requisicao('/cavalos', 'POST', dados);
}

export function editarCavalo(id, dados) {
  return requisicao('/cavalos/' + id, 'PUT', dados);
}

export function excluirCavalo(id) {
  return requisicao('/cavalos/' + id, 'DELETE');
}
