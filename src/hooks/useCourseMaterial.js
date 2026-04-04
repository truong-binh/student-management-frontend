import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

export const useCourseMaterials = (courseId) => {
    const queryClient = useQueryClient();

    const materialsQuery = useQuery({
        queryKey: ['courses', courseId, 'materials'],
        queryFn: async () => {
            const res = await courseApi.getMaterials(courseId);
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : (res.data?.items || []);
        },
        enabled: !!courseId,
    });

    const uploadMaterialsMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await courseApi.uploadMaterials(courseId, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'materials'] });
        },
    });

    const updateMaterialMutation = useMutation({
        mutationFn: async ({ materialId, title }) => {
            const res = await courseApi.updateMaterial(courseId, materialId, { title });
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'materials'] });
        },
    });

    const deleteMaterialMutation = useMutation({
        mutationFn: async (materialId) => {
            const res = await courseApi.deleteMaterial(courseId, materialId);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'materials'] });
        },
    });

    return {
        materials: materialsQuery.data || [],
        isLoadingMaterials: materialsQuery.isLoading,
        materialsError: materialsQuery.error,
        uploadMaterials: uploadMaterialsMutation.mutateAsync,
        isUploadingMaterials: uploadMaterialsMutation.isPending,
        updateMaterialTitle: async (materialId, title) => updateMaterialMutation.mutateAsync({ materialId, title }),
        isUpdatingMaterial: updateMaterialMutation.isPending,
        deleteMaterial: deleteMaterialMutation.mutateAsync,
        isDeletingMaterial: deleteMaterialMutation.isPending,
    };
};
