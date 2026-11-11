<?php
// Acesso à tabela servicos
class Model_Servico extends Model
{
    public static function listar()
    {
        return DB::select('id', 'nome_servico', 'preco')
            ->from('servicos')
            ->order_by('nome_servico')
            ->execute()
            ->as_array();
    }

    public static function buscar($id)
    {
        $linhas = DB::select('id', 'nome_servico', 'preco')
            ->from('servicos')
            ->where('id', '=', $id)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    public static function criar($nome, $preco)
    {
        $resultado = DB::insert('servicos')
            ->set(array('nome_servico' => $nome, 'preco' => $preco))
            ->execute();

        return (int) $resultado[0];
    }

    public static function atualizar($id, $nome, $preco)
    {
        DB::update('servicos')
            ->set(array('nome_servico' => $nome, 'preco' => $preco))
            ->where('id', '=', $id)
            ->execute();
    }

    public static function excluir($id)
    {
        DB::delete('servicos')->where('id', '=', $id)->execute();
    }

    // Quantos agendamentos usam este serviço
    public static function contar_agendamentos($id)
    {
        return (int) DB::select(DB::expr('COUNT(*) AS total'))
            ->from('cavalo_servico')
            ->where('servico_id', '=', $id)
            ->execute()
            ->get('total');
    }
}