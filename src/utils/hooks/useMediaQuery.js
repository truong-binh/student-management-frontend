import { useState, useEffect } from 'react';

/**
 * Theo dõi một media query và chỉ render lại khi kết quả khớp thay đổi
 * (khác useWindowSize: không render lại theo từng pixel khi resize).
 *
 * @param {string} query - ví dụ '(max-width: 992px)'
 * @returns {boolean}
 */
const useMediaQuery = (query) => {
    const getMatches = () => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState(getMatches);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return undefined;

        const mediaQueryList = window.matchMedia(query);
        const handleChange = (event) => setMatches(event.matches);

        setMatches(mediaQueryList.matches);

        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handleChange);
            return () => mediaQueryList.removeEventListener('change', handleChange);
        }

        // Safari < 14
        mediaQueryList.addListener(handleChange);
        return () => mediaQueryList.removeListener(handleChange);
    }, [query]);

    return matches;
};

export default useMediaQuery;
