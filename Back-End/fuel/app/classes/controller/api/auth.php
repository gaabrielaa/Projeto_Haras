<?php
// POST /api/auth/login  -> login (público)
// GET  /api/auth/eu     -> dados do usuário logado (exige token)
class Controller_Api_Auth extends Controller_Base
{
    protected $acoes_publicas = array('post_login');

    public function post_login()
    {
        $dados = $this->ler_dados();
        $email = trim((string) Arr::get($dados, 'email', ''));
        $senha = (string) Arr::get($dados, 'senha', '');

        if ($email === '' || $senha === '')
        {
            return $this->response(array('erro' => 'Informe o e-mail e a senha.'), 400);
        }

        $usuario = Model_Usuario::buscar_por_email($email);

        // A mesma mensagem para e-mail ou senha errados
        if ($usuario === null || ! password_verify($senha, $usuario['senha']))
        {
            return $this->response(array('erro' => 'E-mail ou senha incorretos.'), 401);
        }

        return $this->response(array(
            'token'   => $this->gerar_token((int) $usuario['id']),
            'usuario' => array(
                'id'    => (int) $usuario['id'],
                'nome'  => $usuario['nome'],
                'email' => $usuario['email'],
            ),
        ));
    }

    public function get_eu()
    {
        $usuario = Model_Usuario::buscar_por_id($this->usuario_id);

        if ($usuario === null)
        {
            return $this->response(array('erro' => 'Usuário não encontrado.'), 404);
        }

        return $this->response($usuario);
    }
}