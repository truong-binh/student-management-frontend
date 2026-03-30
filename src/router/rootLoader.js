import { redirect } from "react-router-dom";
import { getMe } from "@/api/user/auth/index.js";
import { getAuthTokenAdmin, removeAuthTokenAdmin, getAuthTokenStudent, removeAuthTokenStudent } from "../utils/localStorage.js";
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
    const { isAuthSuccess, authUser, setAuthUser } = useAuthStore.getState();
    const token = getAuthTokenStudent();

    if (!isAuthSuccess && token) {
      try {
        const { data: res } = await getMe();
        setAuthUser({
          isAuthSuccess: true,
          data: res.data
        });
      } catch (error) {
        if (error.response?.data?.status === 401) {
          removeAuthTokenStudent();
        }
      }
    }

    const currentAuthState = useAuthStore.getState();
    const isAuthRoute = ["/login", "/register", "/verify-email", "/forgot-password"].includes(url.pathname);

    if (currentAuthState.isAuthSuccess && currentAuthState.authUser) {
      const isLecturer = currentAuthState.authUser.role === "LECTURER";
      const isTeacherRoute = url.pathname.startsWith("/teacher");
      const isStudentRoute = ["/dashboard", "/classes", "/schedule", "/feedback", "/profile"].some(p => url.pathname.startsWith(p));

      const dashboardPath = isLecturer ? "/teacher/dashboard" : "/dashboard";

      if (url.pathname === "/" || isAuthRoute) {
        return redirect(dashboardPath);
      }

      if (isLecturer && isStudentRoute) {
        return redirect("/teacher/dashboard");
      }

      if (!isLecturer && isTeacherRoute) {
        return redirect("/dashboard");
      }
    } else if (requiredAuth && !currentAuthState.isAuthSuccess) {
      return redirect("/login");
    }
  }

  return null;
};
