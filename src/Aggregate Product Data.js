// This step aggregates/sorts product data from both vendors, with support for single-vendor PRODUCT_LINK flow
;(async () => {
  const contextProducts = getContext("products") || {}

  // Defensive: Normalize context into amazon/flipkart arrays
  let amazon = contextProducts.amazon || []
  let flipkart = contextProducts.flipkart || []

  // If neither exists, see if context contains exactly one vendor (e.g. PRODUCT_LINK flow)
  const vendorKeys = Object.keys(contextProducts)
  if (vendorKeys.length === 1 && Array.isArray(contextProducts[vendorKeys[0]])) {
    if (vendorKeys[0] === "amazon") {
      amazon = contextProducts.amazon
    } else if (vendorKeys[0] === "flipkart") {
      flipkart = contextProducts.flipkart
    } else {
      // Unrecognized vendor but still forward for logic
      amazon = contextProducts[vendorKeys[0]]
    }
  }
  // If both arrays are still empty, no usable product data
  if ((!amazon || !Array.isArray(amazon) || amazon.length === 0) && (!flipkart || !Array.isArray(flipkart) || flipkart.length === 0)) {
    console.error("No product data found in context. Context was:", contextProducts)
    throw new Error("Missing product data from context")
  }

  // Combine non-empty vendor arrays
  const allProducts = [...(Array.isArray(amazon) ? amazon : []), ...(Array.isArray(flipkart) ? flipkart : [])]
  if (!allProducts.length) {
    console.error("No products to aggregate (after normalization). Context:", contextProducts)
    throw new Error("Missing product data after normalization")
  }
  // Example: sort by price ascending
  allProducts.sort((a, b) => a.price - b.price)

  setContext("allProducts", allProducts)
  console.log("Aggregated product data:", allProducts)
})()
