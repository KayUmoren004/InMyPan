# Expo Router and Tailwind CSS

Use [Expo Router](https://docs.expo.dev/router/introduction/) with [Nativewind](https://www.nativewind.dev/v4/overview/) styling.

## 🚀 How to use

```sh
npx create-expo-app -e with-tailwindcss
```

## Deploy

Deploy on all platforms with Expo Application Services (EAS).

- Deploy the website: `npx eas-cli deploy` — [Learn more](https://docs.expo.dev/eas/hosting/get-started/)
- Deploy on iOS and Android using: `npx eas-cli build` — [Learn more](https://expo.dev/eas)


# Search and Friends Feature README

This document outlines the steps to deploy and configure the backend for the "Search users and add friends" feature.

## 1. Firebase & Algolia Setup

1.  **Firebase Project:** Create a new Firebase project or use an existing one.
2.  **Algolia Account:** Create a new Algolia account.
3.  **Install Firebase CLI:** If you haven't already, install the Firebase CLI: `npm install -g firebase-tools`.
4.  **Login to Firebase:** `firebase login`.

## 2. Deploy Cloud Functions

1.  **Set Algolia Environment Variables:** In the `functions` directory, set the following environment variables. You can find these in your Algolia dashboard.

    ```bash
    firebase functions:config:set algolia.app_id="YOUR_ALGOLIA_APP_ID"
    firebase functions:config:set algolia.api_key="YOUR_ALGOLIA_ADMIN_API_KEY"
    firebase functions:config:set algolia.search_key="YOUR_ALGOLIA_SEARCH_ONLY_API_KEY"
    ```

2.  **Deploy Functions:**

    ```bash
    firebase deploy --only functions
    ```

## 3. Install "Search with Algolia" Extension

1.  Go to the Firebase console and navigate to the **Extensions** page.
2.  Install the **"Search with Algolia"** extension.
3.  **Configuration:**
    *   **Cloud Functions for Firebase location:** Select the same location as your other functions.
    *   **Collection path:** `users`
    *   **Algolia app ID, API key, and index name:** Use your Algolia credentials. For the index name, use `users`.
    *   **Transformation function:** `transformRecord`

## 4. Firestore Security Rules

Deploy the `firestore.rules` file to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

## 5. Notes on Privacy

-   The `transformRecord` function only indexes public user data. Private fields like email and phone number are not indexed.
-   The `isSearchable` flag in the `users` collection controls which users appear in search results. By default, users are not searchable.
-   Secured Algolia search keys are generated on the server-side by the `getAlgoliaSecuredKey` Cloud Function. These keys are short-lived and restricted to the `users` index with the `isSearchable:true` filter, ensuring that clients can only search the intended data.
