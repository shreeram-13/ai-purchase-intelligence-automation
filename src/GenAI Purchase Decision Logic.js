// This step uses Google Gemini to generate purchase recommendations using price history
const { GoogleGenAI } = require("@google/genai")

;(async () => {
  try {
    const allProducts = getContext("allProducts")
    if (!allProducts) throw new Error("No aggregated product data in context")

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY environment variable")

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

    // Include price summary details for each product
    function formatProductSummary(p) {
      return `- ${p.name} [Vendor: ${p.vendor}, Price: ₹${p.price},\n  Price Summary: Current: ₹${p.price_summary?.current}, Lowest: ₹${p.price_summary?.lowest}, Highest: ₹${p.price_summary?.highest}, Average: ₹${p.price_summary?.average}, % Above Lowest: ${p.price_summary?.pct_above_low}%${p.rating ? ", Rating: " + p.rating : ""}]`
    }

    const prompt = `You are an AI shopping assistant.\nGiven these products with their 30-day price histories, price summary (current, lowest, highest, average, percent above lowest), and vendor, analyze and output a purchase recommendation in this strict JSON format:\n\n{\n  "recommendation": "Buy now" | "Wait" | "Consider alternative",\n  "reason": string,\n  "estimated_savings": string,  // In INR (e.g., "Rs. 950"), or "N/A"\n  "best_platform": "Amazon" | "Flipkart",\n  "best_buy_time_window": string // e.g. "Next 2 days", "Upcoming Sale", "Wait till prices drop"\n}\n\nInput Products:\n${allProducts.map(formatProductSummary).join("\n")}\n\nONLY return the JSON object, nothing else. Be succinct and demo-readable.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })

    let structuredOutput
    try {
      structuredOutput = JSON.parse(response.text)
    } catch {
      const match = response.text.match(/\{[\s\S]*\}/)
      structuredOutput = match ? JSON.parse(match[0]) : { error: "Could not parse recommendation" }
    }
    setContext("recommendations", structuredOutput)

    // Log output formatted for demonstration
    console.log("\n===== PURCHASE RECOMMENDATION =====\n")
    if (structuredOutput && !structuredOutput.error) {
      console.log(`Buy Decision:        ${structuredOutput.recommendation}`)
      console.log(`Reason:             ${structuredOutput.reason}`)
      console.log(`Estimated Savings:  ${structuredOutput.estimated_savings}`)
      console.log(`Best Platform:      ${structuredOutput.best_platform}`)
      console.log(`Buy Time Window:    ${structuredOutput.best_buy_time_window}`)
    } else {
      console.log("AI output could not be parsed:", response.text)
    }
    console.log("\n===================================\n")
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
