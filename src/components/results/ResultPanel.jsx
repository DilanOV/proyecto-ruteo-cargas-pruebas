import StatisticsPanel from '../statistics/StatisticsPanel.jsx';
import CapacityBar from '../vehicle/CapacityBar.jsx';
import SelectedOrders from '../visualization/SelectedOrders.jsx';

function ResultPanel({ result }) {
  if (!result) {
    return (
      <p className="empty-state">
        Ejecuta el algoritmo para ver los pedidos seleccionados y las estadísticas.
      </p>
    );
  }

  return (
    <>
      <div className="panel__section">
        <StatisticsPanel result={result} />
      </div>
      <div className="panel__section">
        <CapacityBar
          usedWeight={result.totalWeight}
          capacity={result.capacity}
          occupancy={result.occupancy}
        />
      </div>
      <div className="panel__section">
        <h3 className="panel__section-title">
          Pedidos seleccionados ({result.selectedOrders.length})
        </h3>
        <SelectedOrders orders={result.selectedOrders} />
      </div>
    </>
  );
}

export default ResultPanel;
