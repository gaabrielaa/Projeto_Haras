<?php
// Números do dashboard, contados direto no banco
class Model_Dashboard extends Model
{
    // Conta os registros de uma tabela (e, se quiser, só os de um status)
    private static function contar($tabela, $status = null)
    {
        $consulta = DB::select(DB::expr('COUNT(*) AS total'))->from($tabela);

        if ($status !== null)
        {
            $consulta->where('status', '=', $status);
        }

        return (int) $consulta->execute()->get('total');
    }

    public static function resumo()
    {
        return array(
            'total_cavalos'  => self::contar('cavalos'),
            'total_baias'    => self::contar('baias'),
            'baias_ocupadas' => self::contar('baias', 'ocupada'),
            'baias_livres'   => self::contar('baias', 'livre'),
            'total_servicos' => self::contar('servicos'),
        );
    }
}