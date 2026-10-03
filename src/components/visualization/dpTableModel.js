export function cellKey(row, capacity) {
  return `${row}:${capacity}`;
}

export function getPageRange(pageIndex, pageSize, totalItems) {
  const start = pageIndex * pageSize;
  return { start, end: Math.min(start + pageSize, totalItems) };
}

export function getPageCount(pageSize, totalItems) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function buildTraceLookup(tracePath) {
  return new Map(tracePath.map(({ row, capacity, taken }) => [cellKey(row, capacity), taken]));
}

/**
 * Describe cómo se obtuvo DP[row][capacity] y qué celdas de la fila anterior consultó.
 */
export function explainCell(dpTable, orders, row, capacity) {
  const value = dpTable[row][capacity];

  if (row === 0) {
    return {
      value,
      decision: 'base',
      dependencies: [],
      withoutOrder: null,
      withOrder: null,
      order: null,
    };
  }

  const order = orders[row - 1];
  const withoutOrder = dpTable[row - 1][capacity];

  if (order.weight > capacity) {
    return {
      value,
      decision: 'does-not-fit',
      dependencies: [{ row: row - 1, capacity }],
      withoutOrder,
      withOrder: null,
      order,
    };
  }

  const remainingCapacity = capacity - order.weight;
  const withOrder = order.profit + dpTable[row - 1][remainingCapacity];

  return {
    value,
    decision: withOrder > withoutOrder ? 'include' : 'exclude',
    dependencies: [
      { row: row - 1, capacity },
      { row: row - 1, capacity: remainingCapacity },
    ],
    withoutOrder,
    withOrder,
    order,
  };
}
