/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */

import * as functions from "firebase-functions";
import { algoliasearch } from "algoliasearch";
import { CallableRequest } from "firebase-functions/v2/https";
import { config } from "dotenv";

// Load environment variables
config();

// Initialize Algolia client
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || "",
  process.env.ALGOLIA_API_KEY || ""
);

// HTTPS Callable function to generate a secured Algolia search key
export const getAlgoliaSecuredKey = functions.https.onCall(
  async (request: CallableRequest) => {
    // Check for authentication
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const uid = request.auth.uid;

    // Generate a secured API key with restrictions
    const securedApiKey = client.generateSecuredApiKey({
      parentApiKey: process.env.ALGOLIA_SEARCH_KEY || "",
      restrictions: {
        filters: "isSearchable:true",
        restrictIndices: ["users"],
        userToken: uid,
        validUntil: Math.floor(Date.now() / 1000) + 900,
      },
    });

    return { key: securedApiKey };
  }
);
