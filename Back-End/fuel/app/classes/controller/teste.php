<?php
// Controller para testar a conexão. Vai ser apagado depois.
class Controller_Teste extends Controller
{
    public function action_banco()
    {
        $contagem = array(
            'usuarios'       => DB::count_records('usuarios'),
            'cavalos'        => DB::count_records('cavalos'),
            'baias'          => DB::count_records('baias'),
            'servicos'       => DB::count_records('servicos'),
            'cavalo_servico' => DB::count_records('cavalo_servico'),
        );

        return Response::forge(json_encode($contagem), 200, array(
            'Content-Type' => 'application/json',
        ));
    }
}