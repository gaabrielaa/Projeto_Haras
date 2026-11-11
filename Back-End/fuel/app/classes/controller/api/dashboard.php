<?php
// GET /api/dashboard -> números do painel e agendamentos recentes
class Controller_Api_Dashboard extends Controller_Base
{
    public function get_index()
    {
        $dados = Model_Dashboard::resumo();
        $dados['agendamentos_recentes'] = Model_Agendamento::recentes(5);

        return $this->response($dados);
    }
}