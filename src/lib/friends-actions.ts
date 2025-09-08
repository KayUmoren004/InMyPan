import { firestore } from "./firebase-config";
import {
  doc,
  writeBatch,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

// TODO: Implement Sending Notifications

export const sendFriendRequest = async (
  meId: string,
  themId: string,
  refetchAuthUser?: () => Promise<void>
) => {
  console.log("Sending friend request from ", meId, " to ", themId);
  const batch = writeBatch(firestore);

  const myFriendRef = doc(firestore, `users/${meId}/friends/${themId}`);
  const theirFriendRef = doc(firestore, `users/${themId}/friends/${meId}`);

  batch.set(myFriendRef, {
    friendId: themId,
    status: "pending",
    initiatedBy: meId,
    since: serverTimestamp(),
  });

  batch.set(theirFriendRef, {
    friendId: meId,
    status: "pending",
    initiatedBy: meId,
    since: serverTimestamp(),
  });

  await batch.commit();
  if (refetchAuthUser) {
    await refetchAuthUser();
  }
};

export const acceptFriendRequest = async (
  meId: string,
  themId: string,
  refetchAuthUser?: () => Promise<void>
) => {
  await runTransaction(firestore, async (transaction) => {
    const myFriendRef = doc(firestore, `users/${meId}/friends/${themId}`);
    const theirFriendRef = doc(firestore, `users/${themId}/friends/${meId}`);

    transaction.update(myFriendRef, { status: "accepted" });
    transaction.update(theirFriendRef, { status: "accepted" });
  });
  if (refetchAuthUser) {
    await refetchAuthUser();
  }
};

// Similar functions for cancel, unfriend, and block
export const cancelFriendRequest = async (
  meId: string,
  themId: string,
  refetchAuthUser?: () => Promise<void>
) => {
  try {
    console.log("Cancelling friend request from ", meId, " to ", themId);
    await runTransaction(firestore, async (transaction) => {
      const myFriendRef = doc(firestore, `users/${meId}/friends/${themId}`);
      const theirFriendRef = doc(firestore, `users/${themId}/friends/${meId}`);

      console.log("Attempting to delete documents:", {
        myFriendPath: `users/${meId}/friends/${themId}`,
        theirFriendPath: `users/${themId}/friends/${meId}`,
      });

      transaction.delete(myFriendRef);
      transaction.delete(theirFriendRef);
    });

    console.log(
      "Friend request cancellation transaction completed successfully"
    );

    if (refetchAuthUser) {
      await refetchAuthUser();
      console.log("Auth user refetched after cancellation");
    }
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    throw error;
  }
};

export const unfriend = async (
  meId: string,
  themId: string,
  refetchAuthUser?: () => Promise<void>
) => {
  await runTransaction(firestore, async (transaction) => {
    const myFriendRef = doc(firestore, `users/${meId}/friends/${themId}`);
    const theirFriendRef = doc(firestore, `users/${themId}/friends/${meId}`);

    transaction.delete(myFriendRef);
    transaction.delete(theirFriendRef);
  });
  if (refetchAuthUser) {
    await refetchAuthUser();
  }
};
export const blockFriend = async (themId: string) => {
  /* ... */
};
