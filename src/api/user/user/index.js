import { apiAxios } from "@/api/rootApi.js";

export const userApi = {
    getUserById: async (id) => {
        return await apiAxios({
            method: "get",
            url: `/api/users/${id}`,
        });
    },
};
