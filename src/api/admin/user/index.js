import { apiAxios } from "@/api/rootApi.js";

export const userAdminApi = {
    getAllUsersAdmin: async () => {
        return await apiAxios({
            method: "get",
            url: "/api/users/admin",
        });
    },

    updateUser: async (id, data) => {
        return await apiAxios({
            method: "put",
            url: `/api/users/${id}`,
            data,
        });
    },

    updateUserStatus: async (id, status) => {
        return await apiAxios({
            method: "patch",
            url: `/api/users/admin/${id}/status`,
            data: { status },
        });
    },

    updateUserRole: async (id, role) => {
        return await apiAxios({
            method: "patch",
            url: `/api/users/admin/${id}/role`,
            data: { role },
        });
    },
};
