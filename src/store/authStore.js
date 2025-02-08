import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { create } from "zustand";
import { auth, db } from "../config/firebase.config";
import toast from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (navigate, email, password) => {
    set({ loading: true, error: null });
    toast.promise(signInWithEmailAndPassword(auth, email, password), {
      loading: "Logging in..",
      success: async (data) => {
        setTimeout(() => {
          navigate("/");
        }, 2000);

        const userDoc = await getDoc(doc(db, "users", data.user.uid));
        if (userDoc.exists()) {
          set({ loading: false, user: userDoc.data(), error: null });
        } else {
          set({ loading: false, user: data.user, error: null });
        }

        return "Login Successful, you will be redirected to homepage";
      },
      error: (error) => set({ loading: false, user: null, error }),
    });
  },

  reFetch: () => {
    set({ loading: true, error: null });
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          set({ user: userDoc.data() });
        } else {
          set({ user: user });
        }
      } else {
        set({ user: null });
      }
      set({ loading: false });
    });

    return unsubscribe;
  },
}));
