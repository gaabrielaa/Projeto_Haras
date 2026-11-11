<?php
// GET    /api/agendamentos     -> lista
// POST   /api/agendamentos     -> agenda um serviço para um cavalo
// GET    /api/agendamentos/5   -> consulta um
// DELETE /api/agendamentos/5   -> cancela
class Controller_Api_Agendamentos extends Controller_Base
{
    public function get_index()
    {
        return $this->response(Model_Agendamento::listar());
    }

    public function get_item($id)
    {
        $agendamento = Model_Agendamento::buscar((int) $id);

        if ($agendamento === null)
        {
            return $this->response(array('erro' => 'Agendamento não encontrado.'), 404);
        }

        return $this->response($agendamento);
    }

    public function post_index()
    {
        $dados      = $this->ler_dados();
        $cavalo_id  = (int) Arr::get($dados, 'cavalo_id', 0);
        $servico_id = (int) Arr::get($dados, 'servico_id', 0);
        $data       = trim((string) Arr::get($dados, 'data_agendamento', ''));

        $erros = array();

        if (Model_Cavalo::buscar($cavalo_id) === null)
        {
            $erros[] = 'Selecione um cavalo válido.';
        }

        if (Model_Servico::buscar($servico_id) === null)
        {
            $erros[] = 'Selecione um serviço válido.';
        }

        // O React envia a data como 2026-11-20T14:30
        $data_objeto = DateTime::createFromFormat('Y-m-d\TH:i', $data);

        if ( ! $data_objeto || $data_objeto->format('Y-m-d\TH:i') !== $data)
        {
            $erros[] = 'Informe uma data e um horário válidos.';
        }

        if (count($erros) > 0)
        {
            return $this->response(array('erro' => implode(' ', $erros)), 400);
        }

        $id = Model_Agendamento::criar($cavalo_id, $servico_id, $data_objeto->format('Y-m-d H:i:s'));

        return $this->response(Model_Agendamento::buscar($id), 201);
    }

    public function delete_item($id)
    {
        $id = (int) $id;

        if (Model_Agendamento::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Agendamento não encontrado.'), 404);
        }

        Model_Agendamento::excluir($id);

        return $this->response(array('mensagem' => 'Agendamento cancelado.'));
    }
}