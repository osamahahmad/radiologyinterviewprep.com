import './Footer.css';
import React from "react";
import Strings from "../resources/Strings.ts";
import { Link, Typography } from '@mui/joy';
import { useLocation, useNavigate } from 'react-router-dom';
import Paths from '../resources/Paths.ts';

const Footer: React.FC = () => {
  const location = useLocation();
  const _navigate = useNavigate();

  const navigate: Function = (pathname: String) => {
    if (location.pathname !== pathname)
      _navigate(pathname as string, { state: 'scrollToTop' });
    else
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <footer>
    <div>
      <Link color='neutral' onClick={() => navigate(Paths.Terms)}>{Strings.TermsShort}</Link>
      <Link color='neutral' onClick={() => navigate(Paths.Privacy)}>{Strings.Privacy}</Link>
      <Link color='neutral' href='mailto:hello@radiologyinterviewprep.com'>{Strings.ContactUs}</Link>
    </div>
    <Typography color='neutral'>|</Typography>
    <Typography color='neutral'>{Strings.Copyright}</Typography>
  </footer>
}

export default Footer;