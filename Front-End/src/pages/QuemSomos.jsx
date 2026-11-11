// Página institucional (conteúdo fixo)
const integrantes = [
  { nome: 'Gabriella Novaes', ra: '221839' },
  { nome: 'João Fernandes', ra: '221502' },
];

const tecnologias = [
  'React (Front-end)',
  'FuelPHP (Back-end)',
  'MySQL (banco de dados)',
  'PHP, JavaScript, HTML e CSS',
  'JWT (autenticação)',
];

function QuemSomos() {
  return (
    <div>
      <h1>Quem Somos</h1>

      <div className="caixa">
        <h2 className="subtitulo">Sistema para Gestão de Haras / Alojamento Equino</h2>
        <p>
          Plataforma web que organiza a gestão de um haras em um único lugar. Com ela é possível
          cadastrar proprietários e cavalos, controlar a ocupação das baias e agendar os serviços
          oferecidos pelo estabelecimento, como casqueamento, banho e atendimento veterinário.
        </p>
      </div>

      <div className="caixa">
        <h2 className="subtitulo">Integrantes</h2>
        <div className="tabela-area">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>RA</th>
              </tr>
            </thead>
            <tbody>
              {integrantes.map((pessoa) => (
                <tr key={pessoa.ra}>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.ra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="caixa">
        <h2 className="subtitulo">Tecnologias utilizadas</h2>
        <ul className="lista-simples">
          {tecnologias.map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default QuemSomos;