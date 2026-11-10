<?php
// Acesso à tabela baias
class Model_Baia extends Model
{
    // Lista as baias já com o cavalo que ocupa cada uma (se houver)
    public static function listar()
    {
        return DB::select(
                'baias.id', 'baias.numero_baia', 'baias.tamanho', 'baias.status',
                array('cavalos.id', 'cavalo_id'),
                array('cavalos.nome', 'cavalo_nome')
            )
            ->from('baias')
            ->join('cavalos', 'LEFT')->on('cavalos.baia_id', '=', 'baias.id')
            ->order_by('baias.numero_baia')
            ->execute()
            ->as_array();
    }

    public static function buscar($id)
    {
        $linhas = DB::select('id', 'numero_baia', 'tamanho', 'status')
            ->from('baias')
            ->where('id', '=', $id)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    public static function buscar_por_numero($numero)
    {
        $linhas = DB::select('id', 'numero_baia')
            ->from('baias')
            ->where('numero_baia', '=', $numero)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    // Devolve o cavalo que está na baia, ou null se estiver livre
    public static function buscar_ocupante($baia_id)
    {
        $linhas = DB::select('id', 'nome')
            ->from('cavalos')
            ->where('baia_id', '=', $baia_id)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    // Toda baia nova começa livre
    public static function criar($numero, $tamanho)
    {
        $resultado = DB::insert('baias')
            ->set(array(
                'numero_baia' => $numero,
                'tamanho'     => $tamanho,
                'status'      => 'livre',
            ))
            ->execute();

        return (int) $resultado[0];
    }

    public static function atualizar($id, $numero, $tamanho)
    {
        DB::update('baias')
            ->set(array('numero_baia' => $numero, 'tamanho' => $tamanho))
            ->where('id', '=', $id)
            ->execute();
    }

    // Usada pelo model de cavalos: 'livre' ou 'ocupada'
    public static function definir_status($id, $status)
    {
        DB::update('baias')
            ->set(array('status' => $status))
            ->where('id', '=', $id)
            ->execute();
    }
}