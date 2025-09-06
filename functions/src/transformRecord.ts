/**
 * Transform Firestore user doc before pushing to Algolia.
 * This gets called by the Search with Algolia extension.
 * @param {any} snapshot - The snapshot of the document.
 * @param {any} context - The context of the document.
 * @return {object} The transformed document.
 */
exports.transformRecord = (snapshot: any, context: any) => {
  const data = snapshot.data();
  const objectID = snapshot.id; // required for Algolia

  // Flatten displayName if it's a map
  let displayName = "";
  if (data.displayName) {
    const given = data.displayName.givenName || "";
    const family = data.displayName.familyName || "";
    displayName = `${given} ${family}`.trim();
  }

  return {
    objectID,
    ...data, // keep other fields
    displayName, // new flattened field
    givenName: data.displayName?.givenName || null,
    familyName: data.displayName?.familyName || null,
  };
};
