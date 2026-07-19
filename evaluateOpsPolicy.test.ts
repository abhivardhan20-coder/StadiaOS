// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { evaluateOpsPolicy } from './server';

describe('evaluateOpsPolicy', () => {
  it('returns normal level when density is low', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate A', density: 50 }] });
    expect(result.level).toBe('normal');
    expect(result.reasons).toEqual([]);
    expect(result.suggestedActions).toEqual([]);
  });

  it('returns suggest level when density is between 75 and 84', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate B', density: 80 }] });
    expect(result.level).toBe('suggest');
    expect(result.reasons).toEqual(['Gate B density at 80% (>= 75%)']);
    expect(result.suggestedActions).toEqual(['Consider opening overflow route near Gate B']);
  });

  it('returns escalate level when density is 85 or higher', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate C', density: 90 }] });
    expect(result.level).toBe('escalate');
    expect(result.reasons).toEqual(['Gate C density at 90% (>= 85%)']);
    expect(result.suggestedActions).toEqual(['Dispatch security/medical to Gate C']);
  });

  it('returns escalate level when alerts are present, even with low density', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate A', density: 50 }], alerts: ['Fire alarm'] });
    expect(result.level).toBe('escalate');
    expect(result.reasons).toEqual(['Fire alarm']);
  });

  it('overall level is escalate and both reasons appear when one escalates and one suggests', () => {
    const result = evaluateOpsPolicy({
      zones: [
        { name: 'Gate A', density: 80 },
        { name: 'Gate B', density: 90 }
      ]
    });
    expect(result.level).toBe('escalate');
    expect(result.reasons).toContain('Gate A density at 80% (>= 75%)');
    expect(result.reasons).toContain('Gate B density at 90% (>= 85%)');
    expect(result.suggestedActions).toContain('Consider opening overflow route near Gate A');
    expect(result.suggestedActions).toContain('Dispatch security/medical to Gate B');
  });

  it('returns suggest level when density is exactly 75', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate D', density: 75 }] });
    expect(result.level).toBe('suggest');
    expect(result.reasons).toEqual(['Gate D density at 75% (>= 75%)']);
    expect(result.suggestedActions).toEqual(['Consider opening overflow route near Gate D']);
  });

  it('returns escalate level when density is exactly 85', () => {
    const result = evaluateOpsPolicy({ zones: [{ name: 'Gate E', density: 85 }] });
    expect(result.level).toBe('escalate');
    expect(result.reasons).toEqual(['Gate E density at 85% (>= 85%)']);
    expect(result.suggestedActions).toEqual(['Dispatch security/medical to Gate E']);
  });

  it('returns normal level when zones array is empty', () => {
    const result = evaluateOpsPolicy({ zones: [] });
    expect(result.level).toBe('normal');
    expect(result.reasons).toEqual([]);
    expect(result.suggestedActions).toEqual([]);
  });

  it('returns escalate level when multiple zones are over the escalate threshold', () => {
    const result = evaluateOpsPolicy({
      zones: [
        { name: 'Gate A', density: 88 },
        { name: 'Gate B', density: 92 }
      ]
    });
    expect(result.level).toBe('escalate');
    expect(result.reasons).toContain('Gate A density at 88% (>= 85%)');
    expect(result.reasons).toContain('Gate B density at 92% (>= 85%)');
  });
});
