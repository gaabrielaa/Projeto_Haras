<?php
// Acesso à tabela cavalos. Aqui fica a regra de ocupação das baias.
class Model_Cavalo extends Model
{
    // Consulta base: cavalo + nome do proprietário + número da baia
    private static function consulta_base()
    {
        return DB::select(
                'cavalos.id', 'cavalos.nome', 'cavalos.raca', 'cavalos.data_nascimento',
                'cavalos.proprietario_id', 'cavalos.baia_id',
                array('usuarios.nome', 'proprietario_nome'),
                array('baias.numero_baia', 'numero_baia')
            )
            ->from('cavalos')
            ->join('usuarios')->on('usuarios.id', '=', 'cavalos.proprietario_id')
            ->join('baias', 'LEFT')->on('baias.id', '=', 'cavalos.baia_id');
    }

    public static function listar()
    {
        return self::consulta_base()->order_by('cavalos.nome')->execute()->as_array();
    }

    public static function buscar($id)
    {
        $linhas = self::consulta_base()->where('cavalos.id', '=', $id)->execute()->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    // Cadastra o cavalo e, se ele tiver baia, marca a baia como ocupada
    public static function criar($nome, $raca, $nascimento, $proprietario_id, $baia_id)
    {
        DB::start_transaction();

        try
        {
            $resultado = DB::insert('cavalos')
                ->set(array(
                    'nome'            => $nome,
                    'raca'            => $raca,
                    'data_nascimento' => $nascimento,
                    'proprietario_id' => $proprietario_id,
                    'baia_id'         => $baia_id,
                ))
                ->execute();

            if ($baia_id !== null)
            {
                Model_Baia::definir_status($baia_id, 'ocupada');
            }

            DB::commit_transaction();
            return (int) $resultado[0];
        }
        catch (\Exception $erro)
        {
            DB::rollback_transaction();
            throw $erro;
        }
    }

    // Atualiza o cavalo. Se a baia mudou, libera a antiga e ocupa a nova
    public static function atualizar($id, $nome, $raca, $nascimento, $proprietario_id, $nova_baia_id)
    {
        $atual = self::buscar($id);
        $baia_antiga = $atual['baia_id'] === null ? null : (int) $atual['baia_id'];

        DB::start_transaction();

        try
        {
            DB::update('cavalos')
                ->set(array(
                    'nome'            => $nome,
                    'raca'            => $raca,
                    'data_nascimento' => $nascimento,
                    'proprietario_id' => $proprietario_id,
                    'baia_id'         => $nova_baia_id,
                ))
                ->where('id', '=', $id)
                ->execute();

            if ($baia_antiga !== $nova_baia_id)
            {
                if ($baia_antiga !== null)
                {
                    Model_Baia::definir_status($baia_antiga, 'livre');
                }
                if ($nova_baia_id !== null)
                {
                    Model_Baia::definir_status($nova_baia_id, 'ocupada');
                }
            }

            DB::commit_transaction();
        }
        catch (\Exception $erro)
        {
            DB::rollback_transaction();
            throw $erro;
        }
    }

    // Remove os agendamentos do cavalo, o cavalo e libera a baia dele
    public static function excluir($id)
    {
        $atual = self::buscar($id);

        DB::start_transaction();

        try
        {
            DB::delete('cavalo_servico')->where('cavalo_id', '=', $id)->execute();
            DB::delete('cavalos')->where('id', '=', $id)->execute();

            if ($atual['baia_id'] !== null)
            {
                Model_Baia::definir_status((int) $atual['baia_id'], 'livre');
            }

            DB::commit_transaction();
        }
        catch (\Exception $erro)
        {
            DB::rollback_transaction();
            throw $erro;
        }
    }
}