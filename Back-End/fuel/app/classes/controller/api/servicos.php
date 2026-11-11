<?php
// GET    /api/servicos     -> lista
// POST   /api/servicos     -> cadastra
// GET    /api/servicos/5   -> consulta um
// PUT    /api/servicos/5   -> edita nome e preço
// DELETE /api/servicos/5   -> exclui (bloqueado se tiver agendamentos)
class Controller_Api_Servicos extends Controller_Base
{
    public function get_index()
    {
        return $this->response(Model_Servico::listar());
    }

    public function get_item($id)
    {
        $servico = Model_Servico::buscar((int) $id);

        if ($servico === null)
        {
            return $this->response(array('erro' => 'Serviço não encontrado.'), 404);
        }

        return $this->response($servico);
    }

    public function post_index()
    {
        list($erro, $nome, $preco) = $this->validar($this->ler_dados());

        if ($erro !== null)
        {
            return $this->response(array('erro' => $erro), 400);
        }

        $id = Model_Servico::criar($nome, $preco);

        return $this->response(Model_Servico::buscar($id), 201);
    }

    public function put_item($id)
    {
        $id = (int) $id;

        if (Model_Servico::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Serviço não encontrado.'), 404);
        }

        list($erro, $nome, $preco) = $this->validar($this->ler_dados());

        if ($erro !== null)
        {
            return $this->response(array('erro' => $erro), 400);
        }

        Model_Servico::atualizar($id, $nome, $preco);

        return $this->response(Model_Servico::buscar($id));
    }

    public function delete_item($id)
    {
        $id = (int) $id;

        if (Model_Servico::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Serviço não encontrado.'), 404);
        }

        // Não exclui serviço que já foi agendado
        if (Model_Servico::contar_agendamentos($id) > 0)
        {
            return $this->response(array('erro' => 'Este serviço possui agendamentos. Cancele os agendamentos antes de excluir.'), 409);
        }

        Model_Servico::excluir($id);

        return $this->response(array('mensagem' => 'Serviço excluído.'));
    }

    // Devolve array(mensagem_de_erro, nome, preco)
    private function validar($dados)
    {
        $nome  = trim((string) Arr::get($dados, 'nome_servico', ''));
        $preco = str_replace(',', '.', trim((string) Arr::get($dados, 'preco', '')));

        if ($nome === '' || mb_strlen($nome) > 100)
        {
            return array('O nome do serviço é obrigatório (até 100 caracteres).', null, null);
        }

        if ( ! is_numeric($preco))
        {
            return array('Informe um preço válido.', null, null);
        }

        if ((float) $preco < 0)
        {
            return array('O preço não pode ser negativo.', null, null);
        }

        if ((float) $preco > 99999999.99)
        {
            return array('O preço é muito alto.', null, null);
        }

        return array(null, $nome, number_format((float) $preco, 2, '.', ''));
    }
}