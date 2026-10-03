import { useCallback, useMemo, useState } from 'react';
import DPCell from './DPCell.jsx';
import DPCellDetails from './DPCellDetails.jsx';
import DPTablePager from './DPTablePager.jsx';
import {
  buildTraceLookup,
  cellKey,
  explainCell,
  getPageCount,
  getPageRange,
} from './dpTableModel.js';
import { DP_TABLE_VIEW } from '../../constants/config.js';
import { formatNumber } from '../../utils/formatters.js';
import './visualization.css';

const LEGEND_ITEMS = [
  { className: 'dp-legend__swatch--taken', label: 'Pedido incluido (reconstrucción)' },
  { className: 'dp-legend__swatch--skipped', label: 'Pedido excluido (reconstrucción)' },
  { className: 'dp-legend__swatch--dependency', label: 'Celdas consultadas' },
  { className: 'dp-legend__swatch--final', label: 'Resultado DP[n][W]' },
];

function RowHeader({ row, order }) {
  if (row === 0) {
    return (
      <th scope="row" className="dp-table__row-header">
        <span className="dp-table__row-index">0</span> Sin pedidos
      </th>
    );
  }

  return (
    <th scope="row" className="dp-table__row-header" title={order.name}>
      <span className="dp-table__row-index">{row}</span> {order.name}
      <span className="dp-table__row-meta">
        peso {formatNumber(order.weight)} · gan. {formatNumber(order.profit)}
      </span>
    </th>
  );
}

function DPTable({ orders, result }) {
  const { dpTable, tracePath, capacity, statesExplored } = result;
  const { rowsPerPage, columnsPerPage, largeTableWarningStates } = DP_TABLE_VIEW;
  const totalRows = dpTable.length;
  const totalColumns = capacity + 1;

  const [rowPage, setRowPage] = useState(0);
  const [columnPage, setColumnPage] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);

  const traceLookup = useMemo(() => buildTraceLookup(tracePath), [tracePath]);
  const rowRange = getPageRange(rowPage, rowsPerPage, totalRows);
  const columnRange = getPageRange(columnPage, columnsPerPage, totalColumns);

  const explanation = useMemo(
    () =>
      selectedCell && explainCell(dpTable, orders, selectedCell.row, selectedCell.capacity),
    [dpTable, orders, selectedCell],
  );

  const dependencyKeys = useMemo(
    () => new Set(explanation?.dependencies.map((cell) => cellKey(cell.row, cell.capacity))),
    [explanation],
  );

  const selectCell = useCallback((row, cellCapacity) => {
    setSelectedCell({ row, capacity: cellCapacity });
  }, []);

  const jumpToFinalCell = () => {
    const finalRow = totalRows - 1;
    setRowPage(Math.floor(finalRow / rowsPerPage));
    setColumnPage(Math.floor(capacity / columnsPerPage));
    setSelectedCell({ row: finalRow, capacity });
  };

  const visibleRows = [];
  for (let row = rowRange.start; row < rowRange.end; row += 1) {
    visibleRows.push(row);
  }

  const visibleColumns = [];
  for (let column = columnRange.start; column < columnRange.end; column += 1) {
    visibleColumns.push(column);
  }

  const isPaginated = totalRows > rowsPerPage || totalColumns > columnsPerPage;

  return (
    <div className="dp-visualization">
      {statesExplored >= largeTableWarningStates && (
        <p className="alert alert--warning" role="status">
          La tabla tiene {formatNumber(statesExplored)} estados. Para no bloquear la interfaz se
          muestra por bloques de {rowsPerPage} filas × {columnsPerPage} columnas.
        </p>
      )}

      <ul className="dp-legend" aria-label="Leyenda de la tabla">
        {LEGEND_ITEMS.map(({ className, label }) => (
          <li key={className} className="dp-legend__item">
            <span className={`dp-legend__swatch ${className}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      {isPaginated && (
        <div className="dp-pagers">
          <DPTablePager
            label="Filas i"
            range={rowRange}
            total={totalRows}
            pageIndex={rowPage}
            pageCount={getPageCount(rowsPerPage, totalRows)}
            onPageChange={setRowPage}
          />
          <DPTablePager
            label="Capacidades w"
            range={columnRange}
            total={totalColumns}
            pageIndex={columnPage}
            pageCount={getPageCount(columnsPerPage, totalColumns)}
            onPageChange={setColumnPage}
          />
        </div>
      )}

      <div className="table-scroll dp-table__scroll">
        <table className="dp-table">
          <caption className="visually-hidden">
            Tabla de estados DP: filas = pedidos considerados, columnas = capacidad, celda =
            ganancia óptima
          </caption>
          <thead>
            <tr>
              <th scope="col" className="dp-table__corner">
                i \ w
              </th>
              {visibleColumns.map((column) => (
                <th key={column} scope="col" className="dp-table__column-header">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row}>
                <RowHeader row={row} order={orders[row - 1]} />
                {visibleColumns.map((column) => {
                  const key = cellKey(row, column);
                  return (
                    <DPCell
                      key={key}
                      row={row}
                      capacity={column}
                      value={dpTable[row][column]}
                      traceStatus={traceLookup.get(key)}
                      isDependency={dependencyKeys.has(key)}
                      isSelected={selectedCell?.row === row && selectedCell?.capacity === column}
                      isFinal={row === totalRows - 1 && column === capacity}
                      onSelect={selectCell}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DPCellDetails
        selectedCell={selectedCell}
        explanation={explanation}
        onJumpToFinal={jumpToFinalCell}
      />
    </div>
  );
}

export default DPTable;
