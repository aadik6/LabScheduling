import { signInWithEmailAndPassword } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../config/firebase.config";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  user: null,
  loading: null,
  error: null,

  login: async (navigate, email, password) => {
    set({ loading: true, error: null });
    toast.promise(signInWithEmailAndPassword(auth, email, password), {
      loading: "Logging in..",
      success: (data) => {
        setTimeout(() => {
          navigate("/");
        }, 2000);
        console.log(data.user.reloadUserInfo)
        set({ loading: false, user: data.user, error: null });
        return "Login Successful, you will be redirected to homepage";
      },
      error: (error) => set({ loading: false, user: null, error }),
    });
  },
}));
