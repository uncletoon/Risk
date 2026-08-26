// ============================================================================
// Enterprise Risk Intelligence Prompts
// Strictly structured, versioned, and domain-grounded prompt templates
// ============================================================================

/**
 * Prompt for Step 1: Structured Document Extraction & Risk Discovery
 */
function buildDocumentExtractionPrompt(documentText, organizationProfile) {
  const orgDetails = [
    `Organization: "${organizationProfile?.name || "Enterprise"}"`,
    organizationProfile?.industry
      ? `Industry: ${organizationProfile.industry}`
      : null,
    organizationProfile?.business_type
      ? `Type of Business: ${organizationProfile.business_type}`
      : null,
    organizationProfile?.product_types
      ? `Products/Services: ${organizationProfile.product_types}`
      : null,
    organizationProfile?.district || organizationProfile?.sector
      ? `Location: ${[organizationProfile.street_number, organizationProfile.sector, organizationProfile.district].filter(Boolean).join(", ")}`
      : null,
    organizationProfile?.description
      ? `Operational Scope: ${organizationProfile.description}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return `
You are the Chief Risk Officer Intelligence Agent for the Enterprise Risk Intelligence and Decision Support System (ERIDSS).
Your task is to analyze the provided single business document for ${orgDetails} and extract factual business data, evidence, internal controls, and candidate risk factors across the 5 enterprise categories:

1. FINANCIAL (Capital, liquidity, cash flow, debt leverage, revenue, margins)
2. OPERATIONAL (Processes, supply chain, key-person dependency, IT operations, vendor dependencies)
3. STRATEGIC (Market positioning, expansion plans, competitive pressures, business model)
4. LEGAL_REGULATORY (Statutory compliance, litigation, licensing, data protection, regulatory penalties)
5. MARKET (Customer concentration, inflation, foreign exchange, macro-economic conditions)

RULES:
- Extract ONLY what is supported by the document. Do NOT invent facts or figures.
- If information for a category or control is missing, mark data sufficiency as "INSUFFICIENT_DATA".
- For every candidate risk, provide traceable evidence from the document (verbatim text quote and approximate page/sheet/section).
- Provide initial baseline estimates for likelihood (1 to 5) and impact (1 to 5) based solely on documented severity.

DOCUMENT CONTENT:
"""
${documentText.slice(0, 50000)}
"""

Respond STRICTLY with valid JSON following this exact schema:
{
  "document_summary": "Concise summary of document scope and business context (2-3 sentences)",
  "extracted_facts": [
    {
      "category_code": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "LEGAL_REGULATORY" | "MARKET",
      "fact_key": "Descriptive key (e.g. Debt-to-Equity Ratio, Supplier Concentration, Liquidity Ratio)",
      "fact_value": "The extracted value string",
      "numerical_value": number or null,
      "raw_evidence_text": "Verbatim quote or sentence from document",
      "source_location": "Page / Sheet / Section reference if identifiable, else 'Section: Executive/Data'",
      "confidence": number between 0.70 and 1.00
    }
  ],
  "candidate_risks": [
    {
      "category_code": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "LEGAL_REGULATORY" | "MARKET",
      "risk_name": "Clear professional risk title",
      "risk_description": "Detailed explanation of the risk mechanism and why it matters",
      "suggested_likelihood": number between 1 and 5,
      "suggested_impact": number between 1 and 5,
      "evidence_quote": "Exact verbatim excerpt from the document demonstrating this risk",
      "source_location": "Page / Sheet / Section reference",
      "controls_identified": [
        {
          "control_name": "Name of existing control mentioned (e.g. Daily Backups, Credit Insurance)",
          "control_type": "PREVENTATIVE" | "DETECTIVE" | "CORRECTIVE" | "COMPENSATING",
          "effectiveness_pct": number between 0 and 100,
          "status": "EVALUATED" | "INSUFFICIENT_DATA" | "DEFICIENT",
          "evidence": "Mention of control in document"
        }
      ],
      "confidence": "High" | "Medium" | "Low"
    }
  ]
}
`;
}

/**
 * Prompt for Step 2: Post-Calculation Risk Intelligence & Recommendations
 */
function buildPostCalculationIntelligencePrompt(assessmentContext) {
  const {
    organization,
    extractedFacts,
    calculatedRisks,
    categoryScores,
    eriResult,
  } = assessmentContext;

  return `
You are the Senior Enterprise Risk Intelligence AI for ERIDSS.
The deterministic backend risk engine has completed the mathematical calculations for "${organization?.name || "Enterprise"}".
Here are the official calculated scores and extracted facts:

=== ENTERPRISE RISK INDEX (ERI) ===
Final ERI: ${eriResult.eriScore} / 100 (${eriResult.classification})
Category Breakdown:
${JSON.stringify(eriResult.categoryBreakdown, null, 2)}

=== DETERMINISTICALLY CALCULATED RISKS ===
${JSON.stringify(calculatedRisks, null, 2)}

=== EXTRACTED BUSINESS FACTS ===
${JSON.stringify(extractedFacts.slice(0, 30), null, 2)}

TASK:
1. Generate an Executive Summary (150-250 words) suitable for the Board of Directors and Chief Risk Officer explaining the overall risk stance.
2. Provide a Risk Position Overview analyzing the macro and internal resilience of the enterprise.
3. Identify the Top Risk Drivers directly linked to the extracted evidence.
4. Detail Strategic Implications if high-severity risks remain unaddressed over a 12-to-24 month horizon.
5. Formulate actionable, high-impact AI Recommendations prioritized into:
   - IMMEDIATE (0 - 30 days)
   - SHORT_TERM (1 - 3 months)
   - MEDIUM_TERM (3 - 6 months)
   Each recommendation must specify:
   - Clear title
   - Actionable implementation steps
   - Associated risk name
   - Priority (IMMEDIATE, SHORT_TERM, MEDIUM_TERM)
   - Suggested timeframe
   - Expected measurable outcome

Respond STRICTLY with valid JSON following this exact schema:
{
  "executive_summary": "High-level board-ready executive summary text",
  "risk_position_overview": "Comprehensive assessment of organizational resilience and exposure",
  "top_risk_drivers": [
    {
      "driver_title": "Title of driver",
      "category": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "LEGAL_REGULATORY" | "MARKET",
      "impact_summary": "Why this driver is elevating the enterprise risk index",
      "supporting_evidence": "Specific evidence citation"
    }
  ],
  "strategic_implications": "Analytical projection of enterprise vulnerabilities and consequences",
  "recommendations": [
    {
      "title": "Clear action-oriented title",
      "risk_name": "Associated identified risk title",
      "recommendation_text": "Concrete steps to mitigate this vulnerability",
      "priority": "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM",
      "suggested_timeframe": "e.g. 14 days, 30 days, 60 days",
      "expected_outcome": "Measurable reduction in likelihood or impact (e.g. 40% reduction in residual tech risk)"
    }
  ]
}
`;
}

/**
 * Prompt for Step 3: Grounded AI Risk Advisor Contextual Q&A
 */
function buildAdvisorGroundedPrompt(
  question,
  assessmentSummary,
  chatHistory = [],
) {
  const scoresText = (assessmentSummary?.categoryScores || [])
    .map(
      (c) =>
        `• ${c.category_name || c.category_code}: Score ${Number(c.category_score).toFixed(1)}/100 (Weight ${c.category_weight}%)`,
    )
    .join("\n");

  const risksText = (assessmentSummary?.identifiedRisks || [])
    .slice(0, 10)
    .map(
      (r) =>
        `• [${r.category}] ${r.name}: Residual Risk ${Number(r.residualRisk).toFixed(1)} (${r.classification}), Inherent ${r.inherentRisk} (Likelihood: ${r.likelihood}/5, Impact: ${r.impact}/5), Control Effectiveness: ${r.controlEffectiveness}% - ${r.description}`,
    )
    .join("\n");

  const recsText = (assessmentSummary?.recommendations || [])
    .slice(0, 5)
    .map(
      (rec) => `• [${rec.priority}] ${rec.title}: ${rec.recommendation_text}`,
    )
    .join("\n");

  return `
ASSESSMENT CONTEXT:
Organization: ${assessmentSummary?.organization?.name || "Enterprise"} (${assessmentSummary?.organization?.industry || "General"})
Enterprise Risk Index (ERI): ${Number(assessmentSummary?.assessment?.overallERI || 0).toFixed(1)} / 100 (${assessmentSummary?.assessment?.classification || "Moderate"})
Document Scope: ${assessmentSummary?.assessment?.summary || "Standard assessment"}

Category Breakdown:
${scoresText || "No category scores"}

Identified Risks:
${risksText || "No identified risks"}

Remediation Actions:
${recsText || "No recommendations"}

RECENT CONVERSATION:
${chatHistory
  .slice(-4)
  .map((m) => `${m.role === "user" ? "Risk Officer" : "Advisor"}: ${m.content}`)
  .join("\n")}

USER QUESTION:
${question}
`;
}

module.exports = {
  buildDocumentExtractionPrompt,
  buildPostCalculationIntelligencePrompt,
  buildAdvisorGroundedPrompt,
};
