import { useState, useEffect } from "react";
import style from './graphViewer.module.css'

export default function GraphViewer(props) {
    const G = props.graph;
    const nData = props.nodesData;
    const nType = props.nodesType;
    
    var points = [];
    


    return (
        <div className={style.container} >
            <Node node="1" type="article" data="nodeData"/>
            <Link width="200" top="20" left="50" rotate="40"></Link>
        </div>
    )
}

function Node(props) {
    return (
        <div className={style.node}>
            <span>{props.node}</span>
            <div className={style.nodedata}>
                <span>{props.type}</span>
                <br />
                <span>{props.data}</span>
            </div>
        </div>
    )
}

function Link(props) {
    const linkStyle = {
        width: props.width + 'px',
        top: props.top + 'px',
        left: `${props.left}px`,
        transform: `rotate(${props.rotate}deg`,
    }
    return (
        <div className={style.link} style={linkStyle}></div>
    )
}