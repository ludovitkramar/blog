import { useState, useEffect } from "react";
import style from './graphViewer.module.css'

export default function GraphViewer(props) {
    const G = props.graph;
    const nData = props.nodesData;
    const nType = props.nodesType;

    var points = [];

    function escalera(matrix) { //six numbers in array
        if (matrix[3] === 0) return matrix
        if (matrix[0] === 0) return matrix.slice(3).concat(matrix.slice(0, 3)) //switch the first and second line
        const needsSubtracted = 0 - matrix[3];
        const mustBeMultipliedBy = needsSubtracted / matrix[0];
        const resultMatrix = matrix.map((value, index, array) => {
            if (index > 2) return (value + array[index - 3] * mustBeMultipliedBy)
            return value
        })
        return resultMatrix;
    }

    function isMatrixValid(matrix) {
        for (const key in matrix) {
            if (isNaN(matrix[key])) return false
        }
        if (matrix[0] === 0 && matrix[1] === 0) return false
        if (matrix[0] === 0 && matrix[3] === 0) return false
        if (matrix[1] === 0 && matrix[4] === 0) return false
        return true
    }

    function calcularEcuacionDeDosIncognitas(matrix) {
        const matriz = escalera(matrix)
        console.log(matriz);
        if (!isMatrixValid(matriz)) throw('Invalid matrix, can\'t solve');
        var x = 0;
        var y = 0;
        if (matriz[5] === 0 && matriz[4] === 0) return [Infinity, Infinity] //infinitas soluciones
        if (matriz[4] === 0 && matriz[3] === 0) return [null, null] //paralela
        if (matriz[5] === 0) {
            y = 0
        } else {
            y = matriz[5] / matriz[4]
        }
        x = (matriz[2] - (y * matriz[1])) / matriz[0]
        return [x, y]
    }

    console.log(calcularEcuacionDeDosIncognitas([-11, 9, 4, -11, 100, 4]));

    // perform BFS algorithm and create the links 

    // the root node is at (0, 0)
    // when creating links, the line cannot cross with any other line, 
    // except if: the point of intersection is the parent node's point && the other line has the same parent
    // each link is name with a string "0/1" means link from 0 to 1, "/" is necessary to distinguish between "11/1" and "1/11"
    // the links are stored in the object named "links"

    // after all links are created, the points (nodes) will have reverse gravitation and friction that separates one
    // from another and eventually stops them, the links act like spring, so that the points cannot drift too far away
    // a function calculates the forces on every point and moves the one time step, it'll need to be repeated periodically untils movement stops.



    return (
        <div className={style.container} >
            <Node node="1" type="article" data="nodeData" />
            <Link width="200" top="20" left="50" rotate="40"></Link>
        </div>
    )
}

function Node(props) {
    return (
        <div className={style.node}>
            <span>{props.node}</span>
            <div className={style.nodedata} style={{'--nodeID': `"${props.node}"`,}}>
                <span className={style.nodeTitle}>{props.type}</span>
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