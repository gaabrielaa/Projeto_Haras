import { requisicao } from './api';

export function carregarDashboard() {
  return requisicao('/dashboard');
}