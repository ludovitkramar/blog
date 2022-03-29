import { useState, useEffect, useRef } from "react";
import style from './graphViewer.module.css'

export default function GraphViewer(props) {
    const [zoom, setZoom] = useState(100);
    const [xOffset, setxOffset] = useState(200);
    const [yOffset, setyOffset] = useState(200);
    const [points, setPoints] = useState([]);
    const loaded = useRef(false);

    const G = props.graph;
    const nData = props.nodesData;
    const nType = props.nodesType;

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
        //console.log(matriz);
        if (!isMatrixValid(matriz)) throw ('Invalid matrix, can\'t solve');
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

    function getChildsOf(graph, root) {
        var links = graph.slice(2);
        var nodes = [];
        for (var i = 1; i < links.length; i += 2) {
            if (links[i - 1] === root) nodes.push(links[i])
        }
        return nodes
    }

    //console.log(calcularEcuacionDeDosIncognitas([-11, 9, 4, -11, 100, 4]));

    function findParentOf(node, graph) {
        const LinksArray = graph.slice(2);
        for (var index = 1; index < LinksArray.length; index += 2) {
            if (LinksArray[index] === node) return LinksArray[index - 1];
        }
    }

    function generatePointsFromGraph(graph) {
        const nodesCount = graph[0]
        const linksCount = graph[1]
        const links = graph.slice(2);
        const distance = 2;
        var pointsArray = [[0, 0],]; //node 0 (index 0) is on the origin
        var BFSqueue = [0] //start the search from node 0
        var angle = 0;
        while (BFSqueue.length > 0) {
            const currentNode = BFSqueue[0] // the first item on the queue is the current node
            const currentPoint = pointsArray[currentNode] //get the point from which we'll create the new links (vectors)
            const neighbors = getChildsOf(graph, currentNode);
            neighbors.forEach(element => {
                if (!BFSqueue.includes(element)) { //if the queue doesn't have that element
                    BFSqueue.push(element);
                    pointsArray[element] = [distance * Math.cos(angle), distance * Math.sin(angle)]
                    //TODO: check collision
                    angle += .1;
                }
            });
            BFSqueue = BFSqueue.slice(1) //remove the fist item from the queue
        }
        return pointsArray
    }

    function handleScroll(event) {
        console.log(event.deltaY)
        setZoom(zoom - event.deltaY * 0.5)
    }

    function handleDrag(e) {
        // console.log(e);
        if (e.buttons > 0) {
            setxOffset(xOffset + e.movementY)
            setyOffset(yOffset + e.movementX)
        }
    }

    function handleZoom(e) {
        //console.log(e.target.value)
        setZoom(e.target.value * 3)
    }

    function generateReactCode(points) {
        var reactCode = [];
        points.forEach((point, node, points) => {
            const pointX = point[0] * zoom + xOffset;
            const pointY = point[1] * zoom + yOffset;
            //console.log(pointY);
            reactCode.push(
                <Node key={node + "n"} node={node} type={nType[node]} data={nData[node]} top={pointX} left={pointY} />
            )
            try {
                const parentNode = findParentOf(node, G);
                //console.log(parentNode + ' is the parent');
                const linkX1 = points[parentNode][0] * zoom + xOffset;
                const linkY1 = points[parentNode][1] * zoom + yOffset;
                //console.log(`point of parent is: ${linkX1}, ${linkY1}`);
                const length = Math.sqrt((pointX - linkX1) ** 2 + (pointY - linkY1) ** 2)
                const angle = Math.acos((pointX - linkX1) / length)
                //console.log('length');
                //console.log(length)
                //console.log('angle');
                //console.log(angle)
                reactCode.push(
                    <Link key={node + "l"} width={length} top={linkX1} left={linkY1} rotate={angle / Math.PI * 180}></Link>
                )
            } catch (error) {
                //console.error(error)
            }

        })
        return reactCode;
    }

    useEffect(() => {
        if (!loaded.current) {
            const generatedPoints = generatePointsFromGraph(G);
            setPoints(generatedPoints);

            console.log(generatedPoints)
            console.log(points);

            // perform BFS algorithm and create the links 

            // the root node is at (0, 0)
            // when creating links, the line cannot cross with any other line, 
            // except if: the point of intersection is the parent node's point && the other line has the same parent
            // each link is name with a string "0/1" means link from 0 to 1, "/" is necessary to distinguish between "11/1" and "1/11"
            // the links are stored in the object named "links"

            // after all links are created, the points (nodes) will have reverse gravitation and friction that separates one
            // from another and eventually stops them, the links act like spring, so that the points cannot drift too far away
            // a function calculates the forces on every point and moves the one time step, it'll need to be repeated periodically untils movement stops.
            
            loaded.current = true;
        }
    }, [G, generatePointsFromGraph, points])

    const reactCode = generateReactCode(points)

    return (
        <div className={style.container}>
            <input className={style.range} type="range" onChange={handleZoom} min="2" max="200" step=".1"></input>
            <div onMouseMove={handleDrag} className={style.container2}>
                {/* <Node node="1" type="article" data="nodeData" top="40" left="100" />
                <Link width="200" top="20" left="50" rotate="40"></Link> */}
                {reactCode}
            </div>
        </div>
    )
}

function Node(props) {
    const nodeStyle = {
        top: props.top + 'px',
        left: `${props.left}px`,
    }
    return (
        <div className={style.node} style={nodeStyle}>
            <span>{props.node}</span>
            <div className={style.nodedata} style={{ '--nodeID': `"${props.node}"`, }}>
                <span className={style.nodeTitle}>{props.type}</span>
                <br />
                <p className={style.nData}>{props.data}</p>
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