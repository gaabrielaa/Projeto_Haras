<?php
// Acesso à tabela usuarios
class Model_Usuario extends Model
{
    // Lista sem a senha
    public static function listar()
    {
        return DB::select('id', 'nome', 'email', 'telefone')
            ->from('usuarios')
            ->order_by('nome')
            ->execute()
            ->as_array();
    }

    // Usada no login (traz a senha para conferir o hash)
    public static function buscar_por_email($email)
    {
        $linhas = DB::select('id', 'nome', 'email', 'senha', 'telefone')
            ->from('usuarios')
            ->where('email', '=', $email)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    // Esta NÃO traz a senha
    public static function buscar_por_id($id)
    {
        $linhas = DB::select('id', 'nome', 'email', 'telefone', 'created_at')
            ->from('usuarios')
            ->where('id', '=', $id)
            ->execute()
            ->as_array();

        return count($linhas) > 0 ? $linhas[0] : null;
    }

    // Insere o usuário e devolve o id gerado
    public static function criar($nome, $email, $senha_hash, $telefone)
    {
        $resultado = DB::insert('usuarios')
            ->set(array(
                'nome'     => $nome,
                'email'    => $email,
                'senha'    => $senha_hash,
                'telefone' => $telefone,
            ))
            ->execute();

        return (int) $resultado[0];
    }

    // Só troca a senha se $senha_hash for informado
    public static function atualizar($id, $nome, $email, $telefone, $senha_hash = null)
    {
        $campos = array('nome' => $nome, 'email' => $email, 'telefone' => $telefone);

        if ($senha_hash !== null)
        {
            $campos['senha'] = $senha_hash;
        }

        DB::update('usuarios')->set($campos)->where('id', '=', $id)->execute();
    }

    public static function excluir($id)
    {
        DB::delete('usuarios')->where('id', '=', $id)->execute();
    }

    // Quantos cavalos o proprietário tem
    public static function contar_cavalos($id)
    {
        return (int) DB::select(DB::expr('COUNT(*) AS total'))
            ->from('cavalos')
            ->where('proprietario_id', '=', $id)
            ->execute()
            ->get('total');
    }
}