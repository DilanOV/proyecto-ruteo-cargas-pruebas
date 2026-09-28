import { INPUT_LIMITS } from '../constants/config.js';
import { countDPStates } from '../algorithms/dynamicProgramming/metrics.js';
import { formatNumber } from './formatters.js';

export function parseNumericInput(rawValue) {
  if (typeof rawValue === 'number') {
    return rawValue;
  }

  const trimmedValue = String(rawValue ?? '').trim();
  return trimmedValue === '' ? Number.NaN : Number(trimmedValue);
}

function validatePositiveNumber(value, label, maxValue) {
  if (!Number.isFinite(value)) {
    return `${label} debe ser un número válido.`;
  }

  if (value <= 0) {
    return `${label} debe ser mayor que 0.`;
  }

  if (value > maxValue) {
    return `${label} no puede superar ${formatNumber(maxValue)}.`;
  }

  return null;
}

function validatePositiveInteger(value, label, maxValue) {
  const error = validatePositiveNumber(value, label, maxValue);

  if (error) {
    return error;
  }

  return Number.isInteger(value) ? null : `${label} debe ser un número entero.`;
}

function validateCoordinate(value, label) {
  if (!Number.isFinite(value)) {
    return `${label} debe ser un número válido.`;
  }

  return Math.abs(value) > INPUT_LIMITS.maxAbsoluteCoordinate
    ? `${label} debe estar entre ±${formatNumber(INPUT_LIMITS.maxAbsoluteCoordinate)}.`
    : null;
}

function validateName(name) {
  const trimmedName = String(name ?? '').trim();

  if (trimmedName === '') {
    return 'El nombre no puede estar vacío.';
  }

  return trimmedName.length > INPUT_LIMITS.maxNameLength
    ? `El nombre no puede superar ${INPUT_LIMITS.maxNameLength} caracteres.`
    : null;
}

export function validateCapacity(rawValue) {
  const value = parseNumericInput(rawValue);
  const error = validatePositiveInteger(value, 'La capacidad', INPUT_LIMITS.maxCapacity);
  return { value: error ? null : value, error };
}

/**
 * Valida los datos crudos de un formulario de pedido.
 * @returns {{ order: object | null, errors: Record<string, string> }}
 */
export function validateOrderInput(input) {
  const values = {
    name: String(input.name ?? '').trim(),
    weight: parseNumericInput(input.weight),
    profit: parseNumericInput(input.profit),
    x: parseNumericInput(input.x),
    y: parseNumericInput(input.y),
  };

  const fieldErrors = {
    name: validateName(values.name),
    weight: validatePositiveInteger(values.weight, 'El peso', INPUT_LIMITS.maxWeight),
    profit: validatePositiveNumber(values.profit, 'La ganancia', INPUT_LIMITS.maxProfit),
    x: validateCoordinate(values.x, 'La coordenada X'),
    y: validateCoordinate(values.y, 'La coordenada Y'),
  };

  const errors = Object.fromEntries(
    Object.entries(fieldErrors).filter(([, message]) => message !== null),
  );

  return { order: Object.keys(errors).length === 0 ? values : null, errors };
}

export function validateRandomCount(rawValue, { minCount, maxCount }) {
  const value = parseNumericInput(rawValue);

  if (!Number.isInteger(value) || value < minCount || value > maxCount) {
    return { value: null, error: `La cantidad debe ser un entero entre ${minCount} y ${maxCount}.` };
  }

  return { value, error: null };
}

export function validateExecution(orders, capacity) {
  if (orders.length === 0) {
    return 'Agrega al menos un pedido antes de ejecutar el algoritmo.';
  }

  if (orders.length > INPUT_LIMITS.maxOrders) {
    return `Se admiten como máximo ${formatNumber(INPUT_LIMITS.maxOrders)} pedidos por ejecución.`;
  }

  const requiredStates = countDPStates(orders.length, capacity);

  if (requiredStates > INPUT_LIMITS.maxDPStates) {
    return (
      `La tabla DP necesitaría ${formatNumber(requiredStates)} estados ` +
      `(límite: ${formatNumber(INPUT_LIMITS.maxDPStates)}). ` +
      'Reduce la capacidad o la cantidad de pedidos.'
    );
  }

  return null;
}
