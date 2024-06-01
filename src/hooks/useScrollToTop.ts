import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    (location.state === 'scrollToTop') && window.scrollTo(0, 0);
  }, [location]);
};

export default useScrollToTop;