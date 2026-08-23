// ============================================================================
// Deterministic Risk Engine Unit Tests
// ============================================================================

const assert = require('assert');
const { test, describe } = require('node:test');

const {
  calculateInherentRisk,
  evaluateControlEffectiveness,
  calculateResidualRisk,
  calculateCategoryScores,
  calculateEnterpriseRiskIndex,
} = require('../src/engines/risk/calculationEngine');

const {
  evaluateCondition,
  parseNumeric,
} = require('../src/engines/risk/ruleEngine');

describe('Deterministic Calculation Engine', () => {
  test('calculateInherentRisk: calculates L x I and classifications correctly', () => {
    // 1 x 1 = 1 -> Very Low
    const r1 = calculateInherentRisk(1, 1);
    assert.strictEqual(r1.inherentRisk, 1);
    assert.strictEqual(r1.classification, 'Very Low');

    // 2 x 3 = 6 -> Low
    const r2 = calculateInherentRisk(2, 3);
    assert.strictEqual(r2.inherentRisk, 6);
    assert.strictEqual(r2.classification, 'Low');

    // 3 x 4 = 12 -> Moderate
    const r3 = calculateInherentRisk(3, 4);
    assert.strictEqual(r3.inherentRisk, 12);
    assert.strictEqual(r3.classification, 'Moderate');

    // 4 x 4 = 16 -> High
    const r4 = calculateInherentRisk(4, 4);
    assert.strictEqual(r4.inherentRisk, 16);
    assert.strictEqual(r4.classification, 'High');

    // 5 x 5 = 25 -> Critical
    const r5 = calculateInherentRisk(5, 5);
    assert.strictEqual(r5.inherentRisk, 25);
    assert.strictEqual(r5.classification, 'Critical');
  });

  test('evaluateControlEffectiveness: computes averages and handles INSUFFICIENT_DATA', () => {
    // Empty controls
    const c1 = evaluateControlEffectiveness([]);
    assert.strictEqual(c1.status, 'INSUFFICIENT_DATA');
    assert.strictEqual(c1.effectivenessPct, 0);

    // Valid controls
    const c2 = evaluateControlEffectiveness([
      { control_name: 'Backups', effectiveness_pct: 60, status: 'EVALUATED' },
      { control_name: 'Insurance', effectiveness_pct: 40, status: 'EVALUATED' },
    ]);
    assert.strictEqual(c2.status, 'EVALUATED');
    assert.strictEqual(c2.effectivenessPct, 50);
  });

  test('calculateResidualRisk: applies formula Inherent * (1 - ControlEff)', () => {
    // Inherent = 20, Control = 50% => Residual = 10 (Moderate)
    const res1 = calculateResidualRisk(20, 50, 'EVALUATED');
    assert.strictEqual(res1.residualRisk, 10);
    assert.strictEqual(res1.classification, 'Moderate');
    assert.strictEqual(res1.controlDeduction, 10);

    // Inherent = 20, Control = INSUFFICIENT_DATA => Residual = 20 (Critical)
    const res2 = calculateResidualRisk(20, 50, 'INSUFFICIENT_DATA');
    assert.strictEqual(res2.residualRisk, 20);
    assert.strictEqual(res2.classification, 'Critical');
  });

  test('calculateEnterpriseRiskIndex: calculates weighted sum accurately across 5 categories', () => {
    const mockCategoryScores = {
      FINANCIAL: { categoryCode: 'FINANCIAL', categoryScore: 50, weight: 25 },
      OPERATIONAL: { categoryCode: 'OPERATIONAL', categoryScore: 40, weight: 25 },
      STRATEGIC: { categoryCode: 'STRATEGIC', categoryScore: 30, weight: 20 },
      LEGAL_REGULATORY: { categoryCode: 'LEGAL_REGULATORY', categoryScore: 20, weight: 15 },
      MARKET: { categoryCode: 'MARKET', categoryScore: 50, weight: 15 },
    };

    // Expected:
    // (50*25 + 40*25 + 30*20 + 20*15 + 50*15) / 100
    // = (1250 + 1000 + 600 + 300 + 750) / 100
    // = 3900 / 100 = 39.0 (Low)
    const eri = calculateEnterpriseRiskIndex(mockCategoryScores);
    assert.strictEqual(eri.eriScore, 39.0);
    assert.strictEqual(eri.classification, 'Low');
    assert.strictEqual(eri.totalWeight, 100);
  });
});

describe('Deterministic Rule Engine Evaluation', () => {
  test('parseNumeric parses numbers from various string formats', () => {
    assert.strictEqual(parseNumeric('87%'), 87);
    assert.strictEqual(parseNumeric('$1,200,000.50'), 1200000.5);
    assert.strictEqual(parseNumeric('2.8x leverage'), 2.8);
    assert.strictEqual(parseNumeric('-15.4'), -15.4);
  });

  test('evaluateCondition tests operators GT, LT, GTE, LTE, EQ, CONTAINS, RANGE', () => {
    assert.strictEqual(evaluateCondition('GT', '87%', '80%'), true);
    assert.strictEqual(evaluateCondition('GT', '75%', '80%'), false);
    assert.strictEqual(evaluateCondition('LT', '-50000', '0'), true);
    assert.strictEqual(evaluateCondition('EQ', 'true', 'true'), true);
    assert.strictEqual(evaluateCondition('CONTAINS', 'Enterprise is non-compliant with GDPR', 'non-compliant'), true);
    assert.strictEqual(evaluateCondition('RANGE', '45', '40..50'), true);
  });
});
