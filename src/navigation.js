import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';
import articles from './articles/articles.js'

function Nav() {
  function mapArticles(array) {
    const links = array.map((e, i) => {
      return (
        <li key={i}><Link to={'/article/'+e}>{e}</Link></li>
      );
    });

    return links
  };

  return (
    <>
      <nav className={style.nav}>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="q">Article</Link></li>
          <li><Link to="/qad">Link to nowhere</Link></li>
          <li><Link to="/Article">nowhere</Link></li>
          {mapArticles(articles)}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export default Nav;