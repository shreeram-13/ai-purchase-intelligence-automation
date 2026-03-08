// Improved: Email displays Product, Platform, Category; always defined, no undefined/N/A output
;(async () => {
  const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL
  if (!RECIPIENT_EMAIL) throw new Error("Missing RECIPIENT_EMAIL environment variable")

  // Get context for recommendation and product records
  const recommendation = getContext("recommendations")
  const allProducts = getContext("allProducts")
  if (!recommendation) throw new Error("No AI purchase recommendation found in context")
  if (!allProducts) throw new Error("No product data found in context")

  function safeShow(val, fallback = "Unknown") {
    if (val === undefined || val === null || val === "") return fallback
    return (typeof val === "string" ? val.trim() : val) || fallback
  }

  function priceSummaryTable(p) {
    if (!p.price_summary) return ""
    return `
      <ul style="margin-top:4px;">
        <li><strong>Current Price:</strong> ₹${p.price_summary.current}</li>
        <li><strong>Lowest Recorded:</strong> ₹${p.price_summary.lowest}</li>
        <li><strong>Highest Recorded:</strong> ₹${p.price_summary.highest}</li>
        <li><strong>Average Price:</strong> ₹${p.price_summary.average}</li>
        <li><strong>% Above Lowest:</strong> ${p.price_summary.pct_above_low}%</li>
      </ul>`
  }
  function priceSummaryText(p) {
    if (!p.price_summary) return ""
    return `\n  Current: ₹${p.price_summary.current}\n  Lowest: ₹${p.price_summary.lowest}\n  Highest: ₹${p.price_summary.highest}\n  Average: ₹${p.price_summary.average}\n  % Above Lowest: ${p.price_summary.pct_above_low}%`
  }

  // New: Product block shows Product, Platform, Category first, always defined
  const productBlockHtml = allProducts
    .map(
      p => `<li><strong>Product:</strong> ${safeShow(p.product_name, "Demo Product")}<br/>
                <strong>Platform:</strong> ${safeShow(p.platform_source, "Other")}<br/>
                <strong>Category:</strong> ${safeShow(p.category, "General Electronics")}<br/>
                <div style="margin-top:4px;">Price History Summary:${priceSummaryTable(p)}</div>
              </li>`
    )
    .join("")
  const productBlockText = allProducts.map(p => `- Product: ${safeShow(p.product_name)}\n  Platform: ${safeShow(p.platform_source)}\n  Category: ${safeShow(p.category)}${priceSummaryText(p)}`).join("\n\n")

  const emailSubject = `AI Purchase Decision Demo: Recommendation`
  const emailHtml = `
    <h2>AI Purchase Recommendation</h2>
    <ul>${productBlockHtml}</ul>
    <ul>
      <li><strong>Decision:</strong> ${safeShow(recommendation.recommendation, "-")}</li>
      <li><strong>Reasoning:</strong> ${safeShow(recommendation.reason, "-")}</li>
      <li><strong>Estimated Savings:</strong> ${safeShow(recommendation.estimated_savings, "-")}</li>
      <li><strong>Suggested Platform:</strong> ${safeShow(recommendation.best_platform, "-")}</li>
      <li><strong>Best Buying Time Window:</strong> ${safeShow(recommendation.best_buy_time_window, "-")}</li>
    </ul>
    <p style="color: #666; font-size: 12px;">This is a demo email automatically sent by Turbotic AI Automation.</p>
  `
  const emailText = `AI Purchase Recommendation\n\n${productBlockText}\n\nDecision: ${safeShow(recommendation.recommendation, "-")}\nReasoning: ${safeShow(recommendation.reason, "-")}\nEstimated Savings: ${safeShow(recommendation.estimated_savings, "-")}\nSuggested Platform: ${safeShow(recommendation.best_platform, "-")}\nBest Buying Time Window: ${safeShow(recommendation.best_buy_time_window, "-")}`

  const sendResult = await sendEmailViaTurbotic({
    to: RECIPIENT_EMAIL,
    subject: emailSubject,
    html: emailHtml,
    text: emailText
  })

  if (sendResult && sendResult.success) {
    console.log("Recommendation email sent to", RECIPIENT_EMAIL)
  } else {
    throw new Error(`Failed to send email: ${sendResult && sendResult.message}`)
  }
})()
