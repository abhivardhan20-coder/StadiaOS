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
});
