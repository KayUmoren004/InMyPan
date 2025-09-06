
import { firestore } from "./firebase-config";
import { doc, writeBatch, serverTimestamp, runTransaction } from "firebase/firestore";

const auth = { currentUser: { uid: "test-user" } }; // Replace with your actual auth instance

export const sendFriendRequest = async (themId: string) => {
  const meId = auth.currentUser.uid;
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
};

export const acceptFriendRequest = async (themId: string) => {
  const meId = auth.currentUser.uid;
  
  await runTransaction(firestore, async (transaction) => {
    const myFriendRef = doc(firestore, `users/${meId}/friends/${themId}`);
    const theirFriendRef = doc(firestore, `users/${themId}/friends/${meId}`);

    transaction.update(myFriendRef, { status: "accepted" });
    transaction.update(theirFriendRef, { status: "accepted" });
  });
};

// Similar functions for cancel, unfriend, and block
export const cancelFriendRequest = async (themId: string) => { /* ... */ };
export const unfriend = async (themId: string) => { /* ... */ };
export const blockFriend = async (themId: string) => { /* ... */ };

