import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';

function Nav() {
    return (
      <>
        <nav className={style.nav}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="q">Article</Link></li>
            <li><Link to="/qad">Link to nowhere</Link></li>
            <li><Link to="/Article">nowhere</Link></li>
          </ul>
        </nav>
        <Outlet />
      </>
    );
  }

export default Nav;