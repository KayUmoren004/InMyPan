
import { DocumentSnapshot } from "firebase-functions/v1/firestore";

// This function is used by the Firebase "Search with Algolia" extension.
// It transforms a Firestore document snapshot into a record for Algolia.
export const transformRecord = (snapshot: DocumentSnapshot) => {
  const data = snapshot.data();

  if (!data || !data.isSearchable) {
    return null; // Do not index users with isSearchable set to false or undefined
  }

  // Flatten the displayName map
  const displayName = (data.displayName && data.displayName.givenName && data.displayName.familyName)
    ? `${data.displayName.givenName} ${data.displayName.familyName}`
    : "";

  return {
    objectID: snapshot.id,
    displayName,
    givenName: data.displayName?.givenName || "",
    familyName: data.displayName?.familyName || "",
    username: data.username || "",
    avatarUrl: data.avatarUrl || "",
    isSearchable: data.isSearchable,
  };
};
