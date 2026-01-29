import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // State
  loading: false,
  error: null,
  sidebarCollapsed: false,
  isShowSideBar: true,
  goToPage: {
    path: '',
    redirected: false
  },
  breadcrumb: [],
  title: '',
  location: {
    pathName: '',
    prevPathName: '',
    params: {}
  },
  pullDownLoading: false,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setIsShowSideBar: (isShow) => set({ isShowSideBar: isShow }),
  
  setGoToPage: (path) => set({ 
    goToPage: { path, redirected: false } 
  }),
  
  setGoToPageRedirected: () => set((state) => ({
    goToPage: { ...state.goToPage, redirected: true }
  })),
  
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
  
  setTitle: (title) => set({ title }),
  
  setLocation: (location) => set({ location }),
  
  setPullDownLoading: (loading) => set({ pullDownLoading: loading }),
  
  // Getters
  getLoading: () => get().loading,
  getError: () => get().error,
  isSidebarCollapsed: () => get().sidebarCollapsed,
  getIsShowSideBar: () => get().isShowSideBar,
  getGoToPage: () => get().goToPage,
  getBreadcrumb: () => get().breadcrumb,
  getTitle: () => get().title,
  getLocation: () => get().location,
  getPullDownLoading: () => get().pullDownLoading,
})) 