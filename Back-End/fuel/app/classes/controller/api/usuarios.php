<?php
// GET    /api/usuarios     -> lista
// POST   /api/usuarios     -> cadastro (público)
// GET    /api/usuarios/5   -> consulta
// PUT    /api/usuarios/5   -> edita (a senha só muda se for enviada)
// DELETE /api/usuarios/5   -> exclui (bloqueado se tiver cavalos)
class Controller_Api_Usuarios extends Controller_Base
{
    protected $acoes_publicas = array('post_index');

    public function get_index()
    {
        return $this->response(Model_Usuario::listar());
    }

    public function get_item($id)
    {
        $usuario = Model_Usuario::buscar_por_id((int) $id);

        if ($usuario === null)
        {
            return $this->response(array('erro' => 'Usuário não encontrado.'), 404);
        }

        return $this->response($usuario);
    }

    public function post_index()
    {
        $c = $this->ler_campos($this->ler_dados());
        $erros = $this->validar($c, true);

        if (count($erros) > 0)
        {
            return $this->response(array('erro' => implode(' ', $erros)), 400);
        }

        // Impede e-mail duplicado
        if (Model_Usuario::buscar_por_email($c['email']) !== null)
        {
            return $this->response(array('erro' => 'Já existe um usuário com esse e-mail.'), 409);
        }

        $id = Model_Usuario::criar(
            $c['nome'],
            $c['email'],
            password_hash($c['senha'], PASSWORD_DEFAULT),
            $c['telefone']
        );

        return $this->response(array('id' => $id, 'nome' => $c['nome'], 'email' => $c['email']), 201);
    }

    public function put_item($id)
    {
        $id = (int) $id;

        if (Model_Usuario::buscar_por_id($id) === null)
        {
            return $this->response(array('erro' => 'Usuário não encontrado.'), 404);
        }

        $c = $this->ler_campos($this->ler_dados());
        $erros = $this->validar($c, false);

        if (count($erros) > 0)
        {
            return $this->response(array('erro' => implode(' ', $erros)), 400);
        }

        // O e-mail pode ser o do próprio usuário, mas não o de outro
        $existente = Model_Usuario::buscar_por_email($c['email']);

        if ($existente !== null && (int) $existente['id'] !== $id)
        {
            return $this->response(array('erro' => 'Já existe um usuário com esse e-mail.'), 409);
        }

        $senha_hash = $c['senha'] === '' ? null : password_hash($c['senha'], PASSWORD_DEFAULT);

        Model_Usuario::atualizar($id, $c['nome'], $c['email'], $c['telefone'], $senha_hash);

        return $this->response(Model_Usuario::buscar_por_id($id));
    }

    public function delete_item($id)
    {
        $id = (int) $id;

        if ($id === $this->usuario_id)
        {
            return $this->response(array('erro' => 'Você não pode excluir o usuário com o qual está logado.'), 400);
        }

        if (Model_Usuario::buscar_por_id($id) === null)
        {
            return $this->response(array('erro' => 'Usuário não encontrado.'), 404);
        }

        // Não exclui proprietário que ainda tem cavalos
        if (Model_Usuario::contar_cavalos($id) > 0)
        {
            return $this->response(array('erro' => 'Este proprietário possui cavalos cadastrados. Exclua ou transfira os cavalos antes.'), 409);
        }

        Model_Usuario::excluir($id);

        return $this->response(array('mensagem' => 'Usuário excluído.'));
    }

    private function ler_campos($dados)
    {
        return array(
            'nome'     => trim((string) Arr::get($dados, 'nome', '')),
            'email'    => trim((string) Arr::get($dados, 'email', '')),
            'senha'    => (string) Arr::get($dados, 'senha', ''),
            'telefone' => trim((string) Arr::get($dados, 'telefone', '')),
        );
    }

    // Devolve a lista de erros. A senha só é obrigatória no cadastro.
    private function validar($c, $senha_obrigatoria)
    {
        $erros = array();

        if ($c['nome'] === '' || mb_strlen($c['nome']) > 100)
        {
            $erros[] = 'O nome é obrigatório (até 100 caracteres).';
        }

        if ( ! filter_var($c['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($c['email']) > 150)
        {
            $erros[] = 'Informe um e-mail válido.';
        }

        if (($senha_obrigatoria || $c['senha'] !== '') && mb_strlen($c['senha']) < 6)
        {
            $erros[] = 'A senha deve ter pelo menos 6 caracteres.';
        }

        if (mb_strlen($c['telefone']) > 20)
        {
            $erros[] = 'O telefone deve ter até 20 caracteres.';
        }

        return $erros;
    }
}