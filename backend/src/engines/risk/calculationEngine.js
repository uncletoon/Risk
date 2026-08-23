// ============================================================================
// Deterministic Risk Calculation Engine
// Implements mathematical risk scoring, control evaluation, residual risk,
// category index aggregation, and Enterprise Risk Index (ERI).
// ============================================================================

const {
  getInherentClassification,
  getERIClassification,
  RISK_CATEGORIES,
} = require('../../constants/riskConstants');

/**
 * Calculates inherent risk deterministically from likelihood and impact
 * @param {number} likelihood Scale 1 to 5
 * @param {number} impact Scale 1 to 5
 * @returns {{ inherentRisk: number, classification: string }}
 */
function calculateInherentRisk(likelihood, impact) {
  const l = Math.max(1, Math.min(5, Math.round(Number(likelihood) || 3)));
  const i = Math.max(1, Math.min(5, Math.round(Number(impact) || 3)));
  const inherentRisk = l * i; // Max 25
  const classification = getInherentClassification(inherentRisk);

  return {
    likelihood: l,
    impact: i,
    inherentRisk,
    classification,
  };
}

/**
 * Evaluates internal controls and computes overall control effectiveness percentage
 * @param {Array<{ control_name: string, effectiveness_pct?: number, status?: string }>} controls
 * @returns {{ effectivenessPct: number, status: 'EVALUATED' | 'INSUFFICIENT_DATA' }}
 */
function evaluateControlEffectiveness(controls) {
  if (!controls || !Array.isArray(controls) || controls.length === 0) {
    return {
      effectivenessPct: 0.0,
      status: 'INSUFFICIENT_DATA',
    };
  }

  const validControls = controls.filter(
    c => c && typeof c.effectiveness_pct === 'number' && !isNaN(c.effectiveness_pct) && c.status !== 'INSUFFICIENT_DATA'
  );

  if (validControls.length === 0) {
    return {
      effectivenessPct: 0.0,
      status: 'INSUFFICIENT_DATA',
    };
  }

  // Calculate weighted or arithmetic average of control effectiveness
  const total = validControls.reduce((sum, c) => sum + Math.max(0, Math.min(100, c.effectiveness_pct)), 0);
  const avg = Math.round((total / validControls.length) * 100) / 100;

  return {
    effectivenessPct: avg,
    status: 'EVALUATED',
  };
}

/**
 * Calculates residual risk from inherent risk and control effectiveness
 * Formula: Residual Risk = Inherent Risk * (1 - (Control Effectiveness / 100))
 * @param {number} inherentRisk 1 to 25
 * @param {number} controlEffectivenessPct 0 to 100
 * @param {string} controlStatus 'EVALUATED' | 'INSUFFICIENT_DATA'
 * @returns {{ residualRisk: number, classification: string, controlDeduction: number }}
 */
function calculateResidualRisk(inherentRisk, controlEffectivenessPct = 0, controlStatus = 'EVALUATED') {
  const inh = Math.max(1, Math.min(25, Number(inherentRisk) || 1));
  let eff = Math.max(0, Math.min(100, Number(controlEffectivenessPct) || 0));

  if (controlStatus === 'INSUFFICIENT_DATA') {
    eff = 0.0;
  }

  const factor = 1.0 - (eff / 100.0);
  const rawResidual = inh * factor;
  const residualRisk = Math.round(rawResidual * 100) / 100;
  const classification = getInherentClassification(Math.round(residualRisk));
  const controlDeduction = Math.round((inh - residualRisk) * 100) / 100;

  return {
    residualRisk,
    classification,
    controlEffectivenessPct: eff,
    controlStatus,
    controlDeduction,
  };
}

/**
 * Calculates normalized category risk scores (0 to 100) from list of risks
 * @param {Array<{ category_code: string, residual_risk: number }>} identifiedRisks
 * @param {Array<{ code: string, default_weight: number }>} categoriesConfig
 * @returns {Record<string, { categoryCode: string, categoryName: string, categoryScore: number, weight: number, weightedScore: number, riskCount: number }>}
 */
function calculateCategoryScores(identifiedRisks, categoriesConfig = null) {
  const categories = categoriesConfig || Object.values(RISK_CATEGORIES).map(c => ({
    code: c.code,
    name: c.name,
    default_weight: c.defaultWeight,
  }));

  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.code] = {
      categoryCode: cat.code,
      categoryName: cat.name || cat.code,
      categoryScore: 0.0,
      weight: Number(cat.default_weight || cat.defaultWeight || 16.67),
      weightedScore: 0.0,
      riskCount: 0,
      risks: [],
    };
  }

  // Group risks by category
  for (const risk of (identifiedRisks || [])) {
    const code = (risk.category_code || risk.categoryCode || '').toUpperCase();
    if (categoryMap[code]) {
      categoryMap[code].risks.push(risk);
      categoryMap[code].riskCount += 1;
    }
  }

  // Calculate score for each category
  // Formula: Category Score (0-100) = (Average Residual Risk / 25) * 100
  for (const code of Object.keys(categoryMap)) {
    const cat = categoryMap[code];
    if (cat.risks.length > 0) {
      const sumResidual = cat.risks.reduce((sum, r) => sum + (Number(r.residual_risk || r.residualRisk) || 0), 0);
      const avgResidual = sumResidual / cat.risks.length;
      // Normalize from 0-25 scale to 0-100
      const normalizedScore = Math.min(100, Math.round((avgResidual / 25.0) * 100 * 100) / 100);
      cat.categoryScore = normalizedScore;
    } else {
      cat.categoryScore = 0.0;
    }
    cat.weightedScore = Math.round((cat.categoryScore * (cat.weight / 100.0)) * 100) / 100;
  }

  return categoryMap;
}

/**
 * Calculates Enterprise Risk Index (ERI) from category scores and weights
 * Formula: ERI = Sum(Category Score_i * Weight_i) / Sum(Weight_i)
 * @param {Record<string, { categoryScore: number, weight: number }>} categoryScores
 * @returns {{ eriScore: number, classification: string, totalWeight: number, categoryBreakdown: Array }}
 */
function calculateEnterpriseRiskIndex(categoryScores) {
  let weightedSum = 0;
  let totalWeight = 0;
  const breakdown = [];

  for (const key of Object.keys(categoryScores)) {
    const item = categoryScores[key];
    const score = Number(item.categoryScore) || 0;
    const weight = Number(item.weight) || 0;

    weightedSum += score * weight;
    totalWeight += weight;

    breakdown.push({
      categoryCode: item.categoryCode || key,
      categoryName: item.categoryName || key,
      categoryScore: score,
      weight,
      weightedContribution: Math.round((score * (weight / 100)) * 100) / 100,
      riskCount: item.riskCount || 0,
    });
  }

  const finalERI = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
  const classification = getERIClassification(finalERI);

  return {
    eriScore: finalERI,
    classification,
    totalWeight: Math.round(totalWeight * 100) / 100,
    categoryBreakdown: breakdown,
  };
}

module.exports = {
  calculateInherentRisk,
  evaluateControlEffectiveness,
  calculateResidualRisk,
  calculateCategoryScores,
  calculateEnterpriseRiskIndex,
};
