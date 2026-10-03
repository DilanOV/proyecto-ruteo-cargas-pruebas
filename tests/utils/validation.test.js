import { describe, expect, it } from 'vitest';
import {
  parseNumericInput,
  validateCapacity,
  validateExecution,
  validateOrderInput,
  validateRandomCount,
} from '../../src/utils/validation.js';
import { INPUT_LIMITS } from '../../src/constants/config.js';
import { makeOrders } from '../helpers/orders.js';

const VALID_INPUT = { name: 'Refrigerador', weight: '4', profit: '12.5', x: '10', y: '-3' };

describe('parseNumericInput', () => {
  it.each([
    ['12', 12],
    [' 7 ', 7],
    [5, 5],
  ])('convierte %j en %j', (raw, expected) => {
    expect(parseNumericInput(raw)).toBe(expected);
  });

  it.each(['', '   ', 'abc', null, undefined])('interpreta %j como NaN', (raw) => {
    expect(parseNumericInput(raw)).toBeNaN();
  });
});

describe('validateCapacity', () => {
  it('acepta enteros positivos dentro del límite', () => {
    expect(validateCapacity('50')).toEqual({ value: 50, error: null });
  });

  it.each(['0', '-4', '2.5', 'abc', '', 'Infinity', 'NaN', String(INPUT_LIMITS.maxCapacity + 1)])(
    'rechaza %j',
    (raw) => {
      const { value, error } = validateCapacity(raw);
      expect(value).toBeNull();
      expect(error).toEqual(expect.any(String));
    },
  );
});

describe('validateOrderInput', () => {
  it('normaliza un pedido válido', () => {
    const { order, errors } = validateOrderInput({ ...VALID_INPUT, name: '  Refrigerador  ' });

    expect(errors).toEqual({});
    expect(order).toEqual({ name: 'Refrigerador', weight: 4, profit: 12.5, x: 10, y: -3 });
  });

  it.each([
    ['name', '   '],
    ['weight', '0'],
    ['weight', '-3'],
    ['weight', '1.5'],
    ['weight', 'Infinity'],
    ['profit', '0'],
    ['profit', '-10'],
    ['profit', 'NaN'],
    ['x', 'abc'],
    ['y', ''],
  ])('reporta error en %s para %j', (field, rawValue) => {
    const { order, errors } = validateOrderInput({ ...VALID_INPUT, [field]: rawValue });

    expect(order).toBeNull();
    expect(Object.keys(errors)).toEqual([field]);
  });

  it('rechaza nombres demasiado largos', () => {
    const name = 'a'.repeat(INPUT_LIMITS.maxNameLength + 1);
    expect(validateOrderInput({ ...VALID_INPUT, name }).errors.name).toBeDefined();
  });
});

describe('validateRandomCount', () => {
  const limits = { minCount: 1, maxCount: 100 };

  it('acepta cantidades en el rango', () => {
    expect(validateRandomCount('10', limits)).toEqual({ value: 10, error: null });
  });

  it.each(['0', '101', '2.5', ''])('rechaza %j', (raw) => {
    expect(validateRandomCount(raw, limits).error).toEqual(expect.any(String));
  });
});

describe('validateExecution', () => {
  it('exige al menos un pedido', () => {
    expect(validateExecution([], 10)).toMatch(/al menos un pedido/);
  });

  it('acepta una ejecución dentro de los límites', () => {
    expect(validateExecution(makeOrders([[1, 1]]), 10)).toBeNull();
  });

  it('rechaza tablas DP que exceden el límite de estados', () => {
    const orders = makeOrders(Array.from({ length: 100 }, () => [1, 1]));
    expect(validateExecution(orders, INPUT_LIMITS.maxCapacity)).toMatch(/estados/);
  });
});
