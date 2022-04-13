import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';
import { useState, useRef } from "react";

function convertText(text) {
  var title = text.replaceAll('_', " ")
  var firstCharCapitalized = title[0].toUpperCase();
  title = firstCharCapitalized + title.slice(1)
  return title
}

export default function Nav(props) {
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
          {genListItems(props.articlesList, [], true)}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}


function genListItems(items, path, main) { //tiems is an array, path is yet another array, //main is bool
  var output = []
  items.forEach((element, index) => {
    if (typeof (element) === 'string') { //is string
      if (path.length > 0) {
        output.push(<li key={index}><Link to={`/article/${path.join('/')}/${element}`}>{convertText(element)}</Link></li>)
      } else {
        output.push(<li key={index}><Link to={`/article/${element}`}>{convertText(element)}</Link></li>)
      }
    } else {
      if (!main) { //main means main menu bar
        output.push(<SubMenu key={index} array={element} path={path}></SubMenu>) //assume the current element is an array and create submenu
      } else {
        output.push(<CategoryMenu key={index} array={element}></CategoryMenu>)
      }
    }
  });
  return output
}

function SubMenu(props) {
  const [open, setOpen] = useState(false)
  const array = props.array.slice(1);
  const submenuName = props.array[0];
  const path = props.path.concat([submenuName]);
  return (
    <li>
      <div className={style.subMenu}>
        <span onClick={() => { setOpen(!open) }}>
          {open ? <i className="fa fa-caret-down"></i> : <i className="fa fa-caret-right"></i>}
          {" "}{convertText(submenuName)}
        </span>
        {open ? <ul>{genListItems(array, path, false)}</ul> : null}
      </div>
    </li>
  )
}

function CategoryMenu(props) {
  const array = props.array.slice(1);
  const categoryName = props.array[0];
  const menu = useRef();
  const butt = useRef();
  function correctOffset() {
    const ele = menu.current;
    const btt = butt.current;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const ew = ele.offsetWidth;
    const el = btt.getBoundingClientRect().left;
    var offset = 0;
    if (ew + el > vw - 10) offset = vw - 20 - el - ew //if it goes outside of the screen calculate the offset
    //console.log(vw, ew, el, offset);
    ele.style.left = `${offset}px`;
  }
  return (
    <li>
      <div className={style.menuBox} ref={butt} onMouseEnter={correctOffset}>
        <span>{convertText(categoryName)}</span>
        <ul className={style.menuBox} ref={menu}>
          {genListItems(array, [categoryName], false)}
        </ul>
      </div>
    </li>
  )
}