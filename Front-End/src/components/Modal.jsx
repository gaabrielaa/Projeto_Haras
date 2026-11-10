// Janela usada pelos formulários e pela visualização
function Modal({ titulo, aoFechar, children }) {
  return (
    <div className="modal-fundo">
      <div className="modal-caixa">
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button className="modal-fechar" type="button" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;