import { formatNumber } from '../../utils/formatters.js';
import './controls.css';

function ExecutionControls({ canRun, orderCount, capacity, error, onRun, onReset }) {
  const readinessMessage = canRun
    ? `Listo para evaluar ${formatNumber(orderCount)} pedidos con capacidad ${formatNumber(capacity)}.`
    : 'Agrega pedidos y define una capacidad válida para ejecutar.';

  return (
    <div className="execution-controls">
      <div className="execution-controls__row">
        <p className="execution-controls__status">{readinessMessage}</p>
        <div className="execution-controls__buttons">
          <button type="button" className="button button--secondary" onClick={onReset}>
            Reiniciar datos
          </button>
          <button
            type="button"
            className="button button--primary button--large"
            disabled={!canRun}
            onClick={onRun}
          >
            Ejecutar algoritmo
          </button>
        </div>
      </div>
      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ExecutionControls;
