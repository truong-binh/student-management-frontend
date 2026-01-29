import { useAppStore } from '../stores/appStore'

export const useAppState = () => {
  const {
    loading,
    error,
    sidebarCollapsed,
    isShowSideBar,
    goToPage,
    breadcrumb,
    title,
    location,
    pullDownLoading,
    setLoading,
    setError,
    clearError,
    toggleSidebar,
    setSidebarCollapsed,
    setIsShowSideBar,
    setGoToPage,
    setGoToPageRedirected,
    setBreadcrumb,
    setTitle,
    setLocation,
    setPullDownLoading,
  } = useAppStore()

  return {
    // State
    loading,
    error,
    sidebarCollapsed,
    isShowSideBar,
    goToPage,
    breadcrumb,
    title,
    location,
    pullDownLoading,
    
    // Actions
    setLoading,
    setError,
    clearError,
    toggleSidebar,
    setSidebarCollapsed,
    setIsShowSideBar,
    setGoToPage,
    setGoToPageRedirected,
    setBreadcrumb,
    setTitle,
    setLocation,
    setPullDownLoading,
  }
} 