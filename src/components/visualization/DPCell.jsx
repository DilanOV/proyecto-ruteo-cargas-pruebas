import { memo } from 'react';
import { formatNumber } from '../../utils/formatters.js';

const TRACE_CLASS = {
  true: 'dp-cell--taken',
  false: 'dp-cell--skipped',
};

function DPCell({ row, capacity, value, traceStatus, isDependency, isSelected, isFinal, onSelect }) {
  const classNames = [
    'dp-cell',
    TRACE_CLASS[traceStatus],
    isDependency && 'dp-cell--dependency',
    isSelected && 'dp-cell--selected',
    isFinal && 'dp-cell--final',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td className={classNames}>
      <button
        type="button"
        className="dp-cell__button"
        aria-pressed={isSelected}
        aria-label={`DP[${row}][${capacity}] = ${formatNumber(value)}`}
        onClick={() => onSelect(row, capacity)}
      >
        {formatNumber(value)}
      </button>
    </td>
  );
}

export default memo(DPCell);
