import { requisicao } from './api';

export function listarServicos() {
  return requisicao('/servicos');
}

export function cadastrarServico(dados) {
  return requisicao('/servicos', 'POST', dados);
}

export function editarServico(id, dados) {
  return requisicao('/servicos/' + id, 'PUT', dados);
}

export function excluirServico(id) {
  return requisicao('/servicos/' + id, 'DELETE');
}