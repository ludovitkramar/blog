import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';


export default function Nav(props) {
  function mapArticles(array) {
    const links = array.map((e, i) => {
      var title = e.replaceAll('_', " ")
      var firstCharCapitalized = title[0].toUpperCase();
      title = firstCharCapitalized + title.slice(1)
      return (
        <li key={i}><Link to={'/article/' + e}>{title}</Link></li>
      );
    });

    return links
  };

  return (
    <>
      <div className={style.head}><Link to="/">
        <div className={style.logo}>
          <span>blog.</span>
          <span>kykvit</span>
        </div>
      </Link></div>
      <nav className={style.nav}>
        <ul>
          {mapArticles(props.articlesList)}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}