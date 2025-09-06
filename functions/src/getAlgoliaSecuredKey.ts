
import * as functions from "firebase-functions";
import algoliasearch from "algoliasearch";
import {CallableContext} from "firebase-functions/v1/https";

// Initialize Algolia client
const client = algoliasearch(functions.config().algolia.app_id, functions.config().algolia.api_key);

// HTTPS Callable function to generate a secured Algolia search key
export const getAlgoliaSecuredKey = functions.https.onCall(async (data, context: CallableContext) => {
  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = context.auth.uid;

  // Generate a secured API key with restrictions
  const securedApiKey = client.generateSecuredApiKey(
    functions.config().algolia.search_key, // A search-only API key
    {
      filters: "isSearchable:true",
      restrictIndices: "users",
      // Optionally, you can add a user token to the key for rate-limiting
      // See: https://www.algolia.com/doc/guides/security/api-keys/#user-and-rate-limiting
      userToken: uid,
      // Set a TTL for the key (e.g., 15 minutes)
      validUntil: Math.floor(Date.now() / 1000) + 900,
    }
  );

  return { key: securedApiKey };
});

