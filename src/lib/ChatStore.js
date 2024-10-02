import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./Firbase"; // Typo fixed in the import path
import { useUserStore } from "./UserStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: async (chatId, userId) => {
    const currentUser = useUserStore.getState().currentUser;

    try {
      // Fetch the user document from Firestore
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const user = userSnapshot.data();

        // Check if currentUser is blocked by the receiver
        if (user.blocked.includes(currentUser.id)) {
          return set({
            chatId: null,
            user: null,
            isCurrentUserBlocked: true,
            isReceiverBlocked: false,
          });
        }

        // Check if receiver is blocked by the currentUser
        if (currentUser.blocked.includes(userId)) {
          return set({
            chatId,
            user,
            isCurrentUserBlocked: false,
            isReceiverBlocked: true,
          });
        }

        // If no one is blocked
        set({
          chatId,
          user,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
        });
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },

  // Toggle the receiver's blocked state
  changeBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
}));
