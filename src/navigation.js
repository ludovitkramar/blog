import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';
import { useState } from "react";

function convertText(text) {
  var title = text.replaceAll('_', " ")
  var firstCharCapitalized = title[0].toUpperCase();
  title = firstCharCapitalized + title.slice(1)
  return title
}

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
          <CategoryMenu array={['Category', ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz', 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3']}></CategoryMenu>
          {mapArticles(props.articlesList)}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}


function genListItems(items) { //tiems is an array
  var output = []
  items.forEach((element, index) => {
    if (typeof (element) === 'string') { //is string
      output.push(<li key={index}><Link to={'/article/' + element}>{convertText(element)}</Link></li>)
    } else {
      output.push(<SubMenu key={index} array={element}></SubMenu>) //assume the current element is an array and create submenu
    }
  });
  return output
}

function SubMenu(props) {
  const [open, setOpen] = useState(false)
  const array = props.array.slice(1);
  const submenuName = props.array[0];
  return (
    <li>
      <div className={style.subMenu}>
        <span onClick={() => { setOpen(!open) }}>
          {open ? <i class="fa fa-caret-down"></i> : <i class="fa fa-caret-right"></i>}
          {" "}{submenuName}
        </span>
        {open ? <ul>{genListItems(array)}</ul> : null}
      </div>
    </li>
  )
}

function CategoryMenu(props) {
  const [open, setOpen] = useState(false)
  const array = props.array.slice(1);
  const categoryName = props.array[0];
  return (
    <li>
      <div className={open ? style.activeMenuBox + " " + style.menuBox : style.menuBox}>
        <span>{categoryName}</span>
        <ul className={style.menuBox}>{genListItems(array)}</ul>
      </div>
    </li>
  )
}