import { requisicao } from './api';

export function listarAgendamentos() {
  return requisicao('/agendamentos');
}

export function cadastrarAgendamento(dados) {
  return requisicao('/agendamentos', 'POST', dados);
}

export function cancelarAgendamento(id) {
  return requisicao('/agendamentos/' + id, 'DELETE');
}