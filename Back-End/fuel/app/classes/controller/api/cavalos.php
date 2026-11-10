<?php
// GET    /api/cavalos     -> lista
// POST   /api/cavalos     -> cadastra
// GET    /api/cavalos/5   -> consulta um
// PUT    /api/cavalos/5   -> edita
// DELETE /api/cavalos/5   -> exclui (libera a baia e remove os agendamentos)
class Controller_Api_Cavalos extends Controller_Base
{
    public function get_index()
    {
        return $this->response(Model_Cavalo::listar());
    }

    public function get_item($id)
    {
        $cavalo = Model_Cavalo::buscar((int) $id);

        if ($cavalo === null)
        {
            return $this->response(array('erro' => 'Cavalo não encontrado.'), 404);
        }

        return $this->response($cavalo);
    }

    public function post_index()
    {
        list($erros, $c) = $this->validar($this->ler_dados());

        if (count($erros) > 0)
        {
            return $this->response(array('erro' => implode(' ', $erros)), 400);
        }

        try
        {
            $id = Model_Cavalo::criar($c['nome'], $c['raca'], $c['nascimento'], $c['proprietario_id'], $c['baia_id']);
        }
        catch (\Exception $erro)
        {
            return $this->response(array('erro' => 'Não foi possível cadastrar o cavalo.'), 500);
        }

        return $this->response(Model_Cavalo::buscar($id), 201);
    }

    public function put_item($id)
    {
        $id = (int) $id;

        if (Model_Cavalo::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Cavalo não encontrado.'), 404);
        }

        list($erros, $c) = $this->validar($this->ler_dados(), $id);

        if (count($erros) > 0)
        {
            return $this->response(array('erro' => implode(' ', $erros)), 400);
        }

        try
        {
            Model_Cavalo::atualizar($id, $c['nome'], $c['raca'], $c['nascimento'], $c['proprietario_id'], $c['baia_id']);
        }
        catch (\Exception $erro)
        {
            return $this->response(array('erro' => 'Não foi possível atualizar o cavalo.'), 500);
        }

        return $this->response(Model_Cavalo::buscar($id));
    }

    public function delete_item($id)
    {
        $id = (int) $id;

        if (Model_Cavalo::buscar($id) === null)
        {
            return $this->response(array('erro' => 'Cavalo não encontrado.'), 404);
        }

        try
        {
            Model_Cavalo::excluir($id);
        }
        catch (\Exception $erro)
        {
            return $this->response(array('erro' => 'Não foi possível excluir o cavalo.'), 500);
        }

        return $this->response(array('mensagem' => 'Cavalo excluído.'));
    }

    // Valida os dados. Devolve array($erros, $valores_limpos).
    // $cavalo_id é o cavalo que está sendo editado (0 se for cadastro novo).
    private function validar($dados, $cavalo_id = 0)
    {
        $nome       = trim((string) Arr::get($dados, 'nome', ''));
        $raca       = trim((string) Arr::get($dados, 'raca', ''));
        $nascimento = trim((string) Arr::get($dados, 'data_nascimento', ''));
        $proprietario_id = (int) Arr::get($dados, 'proprietario_id', 0);
        $baia_id    = Arr::get($dados, 'baia_id');
        $baia_id    = ($baia_id === null || $baia_id === '') ? null : (int) $baia_id;

        $erros = array();

        if ($nome === '' || mb_strlen($nome) > 100)
        {
            $erros[] = 'O nome é obrigatório (até 100 caracteres).';
        }

        if (mb_strlen($raca) > 100)
        {
            $erros[] = 'A raça deve ter até 100 caracteres.';
        }

        if ($nascimento !== '')
        {
            $data = DateTime::createFromFormat('Y-m-d', $nascimento);

            if ( ! $data || $data->format('Y-m-d') !== $nascimento || $data > new DateTime())
            {
                $erros[] = 'Data de nascimento inválida.';
            }
        }

        if (Model_Usuario::buscar_por_id($proprietario_id) === null)
        {
            $erros[] = 'Selecione um proprietário válido.';
        }

        // Só pode escolher baia livre (ou a baia que o próprio cavalo já ocupa)
        if ($baia_id !== null)
        {
            if (Model_Baia::buscar($baia_id) === null)
            {
                $erros[] = 'Baia não encontrada.';
            }
            else
            {
                $ocupante = Model_Baia::buscar_ocupante($baia_id);

                if ($ocupante !== null && (int) $ocupante['id'] !== $cavalo_id)
                {
                    $erros[] = 'Essa baia já está ocupada por outro cavalo.';
                }
            }
        }

        $valores = array(
            'nome'            => $nome,
            'raca'            => $raca === '' ? null : $raca,
            'nascimento'      => $nascimento === '' ? null : $nascimento,
            'proprietario_id' => $proprietario_id,
            'baia_id'         => $baia_id,
        );

        return array($erros, $valores);
    }
}