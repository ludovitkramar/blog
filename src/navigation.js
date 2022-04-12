import { Outlet, Link } from "react-router-dom";
import style from './navigation.module.css';
import { useState, useRef, useEffect } from "react";

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
          <CategoryMenu array={['Category TEST', ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz', 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], ['Category', 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3'], 'item1', 'item2', ['subMenu', 'sub1', 'sub2', ['subMenu2', 'xyz']], 'item3']}></CategoryMenu>
          {mapArticles(props.articlesList)}
          <CategoryMenu array={['Testing MENU']} />
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
          {open ? <i className="fa fa-caret-down"></i> : <i className="fa fa-caret-right"></i>}
          {" "}{submenuName}
        </span>
        {open ? <ul>{genListItems(array)}</ul> : null}
      </div>
    </li>
  )
}

function CategoryMenu(props) {
  const array = props.array.slice(1);
  const categoryName = props.array[0];
  const menu = useRef();
  const butt = useRef();
  useEffect(() => {
    //prevent menu from overflowing to the right of the viewport
    //TODO: what if the window is resized?
    const ele = menu.current;
    const btt = butt.current;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const ew = ele.offsetWidth;
    ele.classList.toggle(style.tmpStyle) //hide after measuring width
    const el = btt.getBoundingClientRect().left;
    var offset = 0;
    if (ew + el > vw - 10) offset = vw - 20 - el - ew //if it goes outside of the screen calculate the offset
    console.log(vw, ew, el);
    ele.style.left = `${offset}px`;
    //console.log(ele);
    //console.log(btt);
  })
  return (
    <li>
      <div className={style.menuBox} ref={butt}>
        <span>{categoryName}</span>
        <ul className={style.menuBox + " " + style.tmpStyle} ref={menu}>
          {genListItems(array)}
        </ul>
      </div>
    </li>
  )
}