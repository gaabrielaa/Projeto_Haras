<?php
// Acesso à tabela cavalo_servico (agendamentos)
class Model_Agendamento extends Model
{
    // Consulta base: agendamento + cavalo + serviço + proprietário
    private static function consulta_base()
    {
        return DB::select(
                'cavalo_servico.id', 'cavalo_servico.cavalo_id', 'cavalo_servico.servico_id',
                'cavalo_servico.data_agendamento',
                array('cavalos.nome', 'cavalo_nome'),
                array('usuarios.nome', 'proprietario_nome'),
                array('servicos.nome_servico', 'servico_nome'),
                array('servicos.preco', 'preco')
            )
            ->from('cavalo_servico')
            ->join('cavalos')->on('cavalos.id', '=', 'cavalo_servico.cavalo_id')
            ->join('usuarios')->on('usuarios.id', '=', 'cavalos.proprietario_id')
            ->join('servicos')->on('servicos.id', '=', 'cavalo_servico.servico_id');
    }

    public static function listar()
    {
        return self::consulta_base()
            ->order_by('cavalo_servico.data_agendamento', 'DESC')
            ->execute()
            ->as_array();
    }

    // Os últimos agendamentos cadastrados
    public static function recentes($limite)
    {
        return self::consulta_base()
            ->order_by('cavalo_servico.id', 'DESC')
            ->limit($limite)
            ->execute()
            ->as_array();
    }

    public static function buscar($id)
    {
        $linhas = self::consulta_base()
            ->where('cavalo_servico.id', '=', $id)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    public static function criar($cavalo_id, $servico_id, $data)
    {
        $resultado = DB::insert('cavalo_servico')
            ->set(array(
                'cavalo_id'        => $cavalo_id,
                'servico_id'       => $servico_id,
                'data_agendamento' => $data,
            ))
            ->execute();

        return (int) $resultado[0];
    }

    public static function excluir($id)
    {
        DB::delete('cavalo_servico')->where('id', '=', $id)->execute();
    }
}