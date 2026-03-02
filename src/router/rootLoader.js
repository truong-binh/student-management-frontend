import { redirect } from "react-router-dom";
import { getMe } from "@/api/user/auth/index.js";
import { getAuthTokenAdmin, removeAuthTokenAdmin } from "../utils/localStorage.js";
import { hasPermissions } from "../utils/helper.js";
import { useAuthStore } from "../stores/authStore";
import { useAppStore } from "../stores/appStore";
import _ from "lodash";

export const rootLoader = async ({ request, params }, requiredAuth, permissions = []) => {
  const url = new URL(request.url);
  const isAdminRoute = url.pathname.startsWith("/admin");

  if (isAdminRoute) {
    const { isAuthAdminSuccess, setAuthAdmin } = useAuthStore.getState();
    const { setLocation } = useAppStore.getState();

    if (!isAuthAdminSuccess && getAuthTokenAdmin()) {
      try {
        const { data: res } = await getMe();
        setAuthAdmin({
          isAuthAdminSuccess: true,
          data: res.data
        });
      } catch (error) {
        if (error.response?.data?.status === 401) {
          removeAuthTokenAdmin();
        }
      }
    }

    // Get updated state after potential auth update
    const currentAuthState = useAuthStore.getState();

    if (currentAuthState.isAuthAdminSuccess) {
      if (url.pathname === "/admin/login") {
        return redirect("/admin");
      }

      if (!_.isEmpty(permissions) && !hasPermissions(currentAuthState.authAdmin.permissions, ...permissions)) {
        return redirect("/403");
      }
    } else {
      if (requiredAuth) {
        return redirect("/admin/login");
      }
    }

    setLocation({
      pathName: url.pathname,
      prevPathName: useAppStore.getState().location?.pathName || '',
      params,
    });
  } else {
    console.log("Check User");
  }

  return null;
};
