<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Controller base da API: todos os controllers herdam dele.
// verificação do token JWT.
class Controller_Base extends Controller_Rest
{
    protected $rest_format = 'json';

    // Lista vazia deve responder 200 com [] (e não 204 sem conteúdo)
    protected $no_data_status = 200;

    // Ações que podem ser chamadas sem token, no formato "metodo_acao"
    protected $acoes_publicas = array();

    // id do usuário logado (vem de dentro do token)
    protected $usuario_id = null;

    public function before()
    {
        parent::before();
        Config::load('jwt', true);

        $acao = strtolower(Input::method()).'_'.$this->request->action;

        if ( ! in_array($acao, $this->acoes_publicas))
        {
            $this->usuario_id = $this->ler_token();

            if ($this->usuario_id === null)
            {
                $this->negar_acesso();
            }
        }
    }

    // Cria um token com o id do usuário e a data de expiração
    protected function gerar_token($usuario_id)
    {
        $agora = time();
        $dados = array(
            'sub' => $usuario_id,
            'iat' => $agora,
            'exp' => $agora + (Config::get('jwt.expira_em_horas') * 3600),
        );

        return JWT::encode($dados, Config::get('jwt.segredo'), 'HS256');
    }

    // Lê o token do cabeçalho Authorization. Devolve o id ou null se inválido.
    private function ler_token()
    {
        $cabecalho = Input::headers('Authorization', '');

        if ( ! preg_match('/^Bearer\s+(.+)$/i', $cabecalho, $partes))
        {
            return null;
        }

        try
        {
            $dados = JWT::decode($partes[1], new Key(Config::get('jwt.segredo'), 'HS256'));
            return (int) $dados->sub;
        }
        catch (\Exception $erro)
        {
            return null; // token inválido ou expirado
        }
    }

    // Responde 401 e encerra a requisição
    private function negar_acesso()
    {
        $corpo = json_encode(array('erro' => 'Acesso negado. Faça login novamente.'));
        Response::forge($corpo, 401, array('Content-Type' => 'application/json'))->send(true);
        exit;
    }

    // Lê o corpo da requisição (JSON enviado pelo React)
    protected function ler_dados()
    {
        $dados = Input::json();

        if ( ! is_array($dados))
        {
            $dados = Input::post();
        }

        return $dados;
    }
}