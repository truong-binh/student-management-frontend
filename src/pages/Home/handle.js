import { useAuthStore } from "../../stores/authStore";

export default function Handle() {
  const { user: authUser } = useAuthStore();

  return { authUser }
}
