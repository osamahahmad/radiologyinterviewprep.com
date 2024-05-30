import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    (location.pathname !== location.state) && window.scrollTo(0, 0);
  }, [location]);
};

export default useScrollToTop;