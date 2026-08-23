// ============================================================================
// Enterprise Risk Intelligence Prompts
// Strictly structured, versioned, and domain-grounded prompt templates
// ============================================================================

/**
 * Prompt for Step 1: Structured Document Extraction & Risk Discovery
 */
function buildDocumentExtractionPrompt(documentText, organizationProfile) {
  return `
You are the Chief Risk Officer Intelligence Agent for the Enterprise Risk Intelligence and Decision Support System (ERIDSS).
Your task is to analyze the provided single business document for organization "${organizationProfile?.name || 'Enterprise'}" (${organizationProfile?.industry || 'Enterprise Business'}) and extract factual business data, evidence, internal controls, and candidate risk factors across the 6 enterprise categories:

1. FINANCIAL (Capital, liquidity, cash flow, debt leverage, revenue, margins)
2. OPERATIONAL (Processes, supply chain, key-person dependency, IT operations, vendor dependencies)
3. STRATEGIC (Market positioning, expansion plans, competitive pressures, business model)
4. TECHNOLOGICAL (Cybersecurity, MFA coverage, backup systems, legacy systems, IT controls)
5. LEGAL_REGULATORY (Statutory compliance, litigation, licensing, data protection, regulatory penalties)
6. MARKET (Customer concentration, inflation, foreign exchange, macro-economic conditions)

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
      "category_code": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "TECHNOLOGICAL" | "LEGAL_REGULATORY" | "MARKET",
      "fact_key": "Descriptive key (e.g. Debt-to-Equity Ratio, Supplier Concentration, MFA Status)",
      "fact_value": "The extracted value string",
      "numerical_value": number or null,
      "raw_evidence_text": "Verbatim quote or sentence from document",
      "source_location": "Page / Sheet / Section reference if identifiable, else 'Section: Executive/Data'",
      "confidence": number between 0.70 and 1.00
    }
  ],
  "candidate_risks": [
    {
      "category_code": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "TECHNOLOGICAL" | "LEGAL_REGULATORY" | "MARKET",
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
The deterministic backend risk engine has completed the mathematical calculations for "${organization?.name || 'Enterprise'}".
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
      "category": "FINANCIAL" | "OPERATIONAL" | "STRATEGIC" | "TECHNOLOGICAL" | "LEGAL_REGULATORY" | "MARKET",
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
function buildAdvisorGroundedPrompt(question, assessmentSummary, chatHistory = []) {
  return `
You are the Contextual AI Risk Advisor for ERIDSS, paired with the Chief Risk Officer.
You must answer questions grounded STRICTLY in the following stored assessment data.
Do not fabricate information. If data is not present in the assessment, clearly state "This information is not present in the uploaded assessment document."

ASSESSMENT DATA:
"""
${JSON.stringify(assessmentSummary, null, 2).slice(0, 25000)}
"""

RECENT CONVERSATION:
${chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER QUESTION: "${question}"

Provide a direct, analytical, professional response. Cite specific evidence, scores, categories, and figures from the assessment wherever relevant.
`;
}

module.exports = {
  buildDocumentExtractionPrompt,
  buildPostCalculationIntelligencePrompt,
  buildAdvisorGroundedPrompt,
};
