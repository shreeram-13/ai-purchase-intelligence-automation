// This step outputs AI-generated recommendations
;(async () => {
  const recommendations = getContext("recommendations")
  if (!recommendations) throw new Error("No recommendations found in context")

  console.log("Purchase Recommendation Result:")
  console.log(recommendations)
})()
