import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';
import Articles from './articles/articles.js'


export default function Nav() {
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
          {mapArticles(Articles())}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}