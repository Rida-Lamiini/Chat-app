import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./Firbase";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false }); // Corrected set syntax
      } else {
        set({ currentUser: null, isLoading: false }); // Set loading to false after fetch
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false }); // Set loading to false even on error
    }
  },
}));
