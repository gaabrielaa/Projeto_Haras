<?php
// get  /api/baias        lista as baias (cavalo que ocupa cada uma)
// post /api/baias        cadastra baia
// get  /api/baias/5      consulta uma baia
// put  /api/baias/5      edita número e tamanho
// O status muda sozinho quando um cavalo entra ou sai
class Controller_Api_Baias extends Controller_Base
{
    public function get_index()
    {
        return $this->response(Model_Baia::listar());
    }

    public function get_item($id)
    {
        $baia = Model_Baia::buscar((int) $id);

        if ($baia === null)
        {
            return $this->response(array('erro' => 'Baia não encontrada.'), 404);
        }

        return $this->response($baia);
    }

    public function post_index()
    {
        list($erro, $numero, $tamanho) = $this->validar($this->ler_dados());

        if ($erro !== null)
        {
            return $this->response(array('erro' => $erro), 400);
        }

        $id = Model_Baia::criar($numero, $tamanho);

        return $this->response(Model_Baia::buscar($id), 201);
    }

    public function put_item($id)
    {
        $id = (int) $id;

        if (Model_Baia::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Baia não encontrada.'), 404);
        }

        list($erro, $numero, $tamanho) = $this->validar($this->ler_dados(), $id);

        if ($erro !== null)
        {
            return $this->response(array('erro' => $erro), 400);
        }

        Model_Baia::atualizar($id, $numero, $tamanho);

        return $this->response(Model_Baia::buscar($id));
    }

    // devolve um array com mensagem de erro, numero, tamanho
    private function validar($dados, $id_atual = 0)
    {
        $numero  = (string) Arr::get($dados, 'numero_baia', '');
        $tamanho = trim((string) Arr::get($dados, 'tamanho', ''));

        if ( ! ctype_digit($numero) || (int) $numero < 1)
        {
            return array('Informe um número de baia válido (maior que zero).', null, null);
        }

        if (mb_strlen($tamanho) > 50)
        {
            return array('O tamanho deve ter até 50 caracteres.', null, null);
        }

        // número da baia é único
        $existente = Model_Baia::buscar_por_numero((int) $numero);

        if ($existente !== null && (int) $existente['id'] !== $id_atual)
        {
            return array('Já existe uma baia com esse número.', null, null);
        }

        return array(null, (int) $numero, $tamanho === '' ? null : $tamanho);
    }
}