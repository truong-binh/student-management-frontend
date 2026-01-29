import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "../../stores/appStore";

const usePullToRefresh = ({
  hasPermissions
}) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const { pullDownLoading, setPullDownLoading } = useAppStore();
  const isApiCalledRef = useRef(false);
  const refreshThreshold = 50
  
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);
  
  const handleTouchMove = useCallback((e) => {
    if (startY && window.scrollY === 0 && !isApiCalledRef.current && hasPermissions) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      if (distance > 0) {
        setPullDistance(distance);
        if (distance > refreshThreshold && !pullDownLoading) {
          setPullDownLoading(true)
        }
      }
    }
  }, [startY, hasPermissions, pullDownLoading, setPullDownLoading]);

  const handleTouchEnd = useCallback(() => {
    setStartY(0);
    setPullDistance(0);
    isApiCalledRef.current = false;
  }, []);
  
  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => { 
    if (!pullDownLoading){
      handleTouchEnd()
    }
    
  }, [pullDownLoading, handleTouchEnd]);

  return { pullDistance };
};

export default usePullToRefresh;
