import { useState, useEffect, useRef } from "react";
import style from './graphViewer.module.css'

export default function GraphViewer(props) {
    const [zoom, setZoom] = useState(100);
    const [xOffset, setxOffset] = useState(200);
    const [yOffset, setyOffset] = useState(200);
    const [points, setPoints] = useState([]);
    const [line, setLines] = useState([]);
    const [velocities, setVelocities] = useState([]);
    const [graphLength, setGraphLength] = useState(0);
    const [samples, setSamples] = useState([]);
    const [seconds, setSeconds] = useState(0)
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
        if (!isMatrixValid(matriz)) {
            console.warn(matrix);
            throw ('Invalid matrix, can\'t solve');
        }
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

    //console.log(calcularEcuacionDeDosIncognitas([-3, 1, 2, -7, 1, -5])); //para calcular interseccion entre y = 3x + 2 y y = 7x -5

    function findParentOf(node, graph) {
        const LinksArray = graph.slice(2);
        for (var index = 1; index < LinksArray.length; index += 2) {
            if (LinksArray[index] === node) return LinksArray[index - 1];
        }
        return -1
    }

    function checkIntersectionBetweenPoints(m1, n1, lines, exclusions, p1, p2, points, graph) {
        //exclusion is an array of numbers, if the index of an element of the array lines is in exclusions, that line shall be ignored
        var collides = false;
        var intrX = null;
        var intrY = null;
        var intersections = [];
        var lineCrossed = null;
        var linesCrossed = [];
        var done = false;
        var x = null;
        var y = null;
        //console.log('🎵');
        //console.log(exclusions)
        lines.forEach((value, index) => { //index is the node to which the line is directed
            if (!exclusions.includes(index) && !done) { //if not excluded and not done
                const m2 = value[0];
                const n2 = value[1];
                // y = mx + n es el formato de la línea, pero para resolver la ecuación han que convertirlo en: -mx + y = n
                [intrX, intrY] = calcularEcuacionDeDosIncognitas([-m1, 1, n1, -m2, 1, n2])
                //console.log(`Line y = ${m1}x + ${n1} collides at ${intrX},${intrY} with line ${index}`)
                if (!isNaN(intrX)) {
                    const p3 = points[findParentOf(index, graph)];
                    const p4 = points[index];
                    //console.log(index, p3, p4);
                    if (isPointBetweenTwoPoints([intrX, intrY], p1, p2, m1, n1)) {
                        if (isPointBetweenTwoPoints([intrX, intrY], p3, p4, m2, n2)) { //there's no evidence that this works properly, p3 p4 may not be the points that we want
                            x = intrX
                            y = intrY
                            collides = true;
                            lineCrossed = index;
                            intersections.push([x, y]);
                            linesCrossed.push(lineCrossed);
                        }
                    }
                }
            }
        });
        return [collides, intersections, linesCrossed]
    }

    function isPointBetweenTwoPoints(itr, p1, p2, m, n) {
        //console.log('🟠 isPointBetweenTwoPoints ?')
        //console.log(`Intersection=(${itr}), P1=(${p1}), P2=(${p2}), line=(y=${m}x+${n})`)
        if (p1[0] > p2[0]) {
            var temp = p1
            p1 = p2
            p2 = temp
        }
        //console.log(`Intersection=(${itr}), P1=(${p1}), P2=(${p2}), line=(y=${m}x+${n})`)
        if (itr[0] > p1[0] && itr[0] < p2[0]) {
            const intrY = itr[0] * m + n
            //console.log(intrY);
            if (intrY === itr[1] || (intrY + 0.0001 > itr[1] && intrY - 0.0001 < itr[1])) {
                //console.log("⚪ It is 🟠")
                return true
            } else {
                //console.log("🟠 It's not ⚪")
                return false
            }
        } else {
            //console.log("⚪ It's not ⚪")
            return false
        }

    }

    function generatePointsFromGraph(graph) {
        const nodesCount = graph[0]
        const linksCount = graph[1]
        const links = graph.slice(2);
        const distance = 1;
        var pointsArray = [[0, 0],]; //node 0 (index 0) is on the origin
        var linesArray = []; //just like pointsArray, the index is the node number, each element is an array of first "m"  and then "n" of the ecuacion punto pendiante
        var BFSqueue = [0] //start the search from node 0
        while (BFSqueue.length > 0) {
            const abanico = 2;
            const currentNode = BFSqueue[0] // the first item on the queue is the current node
            const currentPoint = pointsArray[currentNode] //get the point from which we'll create the new links (vectors)
            const neighbors = getChildsOf(graph, currentNode);
            var angleIncrement = abanico / neighbors.length;
            if (currentNode === 0) angleIncrement = Math.PI * 1.8 / neighbors.length
            var angle = 0;
            var tempAngle = 0
            tempAngle = Math.acos(currentPoint[0] / Math.sqrt(currentPoint[0] ** 2 + currentPoint[1] ** 2)) // angle = y / root(x^2 + y^2)
            if (currentPoint[1] < 0) tempAngle = -tempAngle;
            if (currentNode !== 0) angle = tempAngle - ((neighbors.length - 1) * angleIncrement / 2);
            neighbors.forEach(element => { //explore neighbors of current node
                if (!BFSqueue.includes(element)) { //if the queue doesn't have that element
                    BFSqueue.push(element); // add to the queue
                    const oldX = currentPoint[0];
                    const oldY = currentPoint[1];
                    var newX = oldX + distance * Math.cos(angle);
                    var newY = oldY + distance * Math.sin(angle);
                    //calculate the line that the two points form in ecuacion punto pendiente format. (m , n)
                    var [m, n] = calcularEcuacionDeDosIncognitas([oldX, 1, oldY, newX, 1, newY]);
                    // console.log(`Line [${element}] is: y = ${m}x + ${n}`);

                    pointsArray[element] = [newX, newY] //add the point of the explred neighbor
                    linesArray[element] = [m, n]; // and line

                    angle += angleIncrement;
                }
            });
            BFSqueue = BFSqueue.slice(1) //remove the fist item from the queue
        }
        return [pointsArray, linesArray]
    }

    function graphChanged(graph, nd) { //graph is a kantenliste, an array of number
        // takes a sample of six random nodes (and their data) and the array length
        // return true if they have changed
        // samples = [] first is the node, second is the nodedata
        const samplesCount = 6

        // console.log(`Recorded graph length = ${graphLength}, computed graph length = ${graph.length}`)
        // console.log(`Current sample are: `)
        // console.log(samples)

        if (graphLength !== graph.length) {
            updateSamples()
            //console.log('did change length');
            return true
        }
        for (var i = 0; i < samplesCount; i++) {
            const currentNode = samples[i][0];
            //console.log(samples[i][1])
            //console.log(nd[currentNode])
            if (samples[i][1] !== nd[currentNode]) {
                //console.log('did change content');
                updateSamples()
                return true
            }
        }
        function updateSamples() {
            const nodesCount = graph[0]
            var tmp = [];
            setGraphLength(graph.length);
            for (var index = 0; index < samplesCount; index++) {
                const rndNode = Math.round((Math.random() * nodesCount) - 1)
                tmp[index] = [rndNode, nd[rndNode]]
            }
            setSamples(tmp)
            // console.log(tmp)
        }
        //console.log('did not change');
        return false
    }

    function vectorLength(v) {
        return Math.sqrt(v[0] ** 2 + v[1] ** 2)
    }

    function distanceBtw2Points(p1, p2) {
        return vectorLength([p2[0] - p1[0], p2[1] - p1[1]])
    }

    function physics(points, lines, velocities, graph) {
        const timeStep = .02; //0.02 = 20ms
        const intersectionAcclFactor = 1;
        const frictionFactor = 1.2;
        const antigravityFactor = 0.01;
        const springFactor = 5;
        var accelArray = [];
        var velArray = velocities;
        var linesArray = lines;
        var pointsArray = points;
        //console.log(points);
        //console.log(lines)
        //console.log(velocities)
        //console.log(graph);

        function sumAccell(node, value, factor) {
            if (accelArray[node]) {
                const v = accelArray[node] //array representing the vector
                accelArray[node] = v.map((val, ind) => {
                    return val + value[ind] * factor
                })
            } else {
                accelArray[node] = value;
            }
        }

        //for each line (all points except 0)
        lines.forEach((value, currentPoint) => {
            const parentPoint = findParentOf(currentPoint, graph)
            const [m, n] = value;
            const p1 = points[parentPoint];
            const p2 = points[currentPoint];
            const allChilds = getChildsOf(graph, currentPoint);
            const childsOfParent = getChildsOf(graph, parentPoint);
            const exclusions = [currentPoint, parentPoint].concat(allChilds).concat(childsOfParent)
            const [collides, intersections, linesCrossed] = checkIntersectionBetweenPoints(m, n, lines, exclusions, p1, p2, points, graph)

            // console.log(`[${currentPoint}] Collides: ${collides}`)
            // console.log(intersections);
            // console.log(linesCrossed)

            // lines intersection force
            var intersectionAccel = [0, 0];
            //for every intersection on the line
            for (var i = 0; i < intersections.length; i++) {
                //console.log(i);
                const p3 = intersections[i]
                const p4 = points[linesCrossed[i]]
                const alpha = p4[0] + m * p4[1]
                const p5 = calcularEcuacionDeDosIncognitas([-m, 1, n, 1, m, alpha])
                var v = [p4[0] - p5[0], p4[1] - p5[1]];
                //console.log(v);
                const vLength = vectorLength(v)
                //console.log(vLength);
                const reductionFactor = distanceBtw2Points(p2, p3) / distanceBtw2Points(p2, p1) + 0.05; //0.25 is the base acceleration
                v = v.map((value) => { return value / vLength * reductionFactor }); //make length of vector = 1, and make the length shorter if the intersection is further from the parent node's point
                intersectionAccel = intersectionAccel.map((value, index) => { return (value + v[index]) }) //add to the sum of intersection accelerations
                //console.log(v)
            }
            sumAccell(currentPoint, intersectionAccel, intersectionAcclFactor)

            //add friction to acceleration
            const curV = velArray[currentPoint];
            sumAccell(currentPoint, [-curV[0], -curV[1]], frictionFactor)

            //reverse gravitation
            for (const key in points) { //for every point
                if (key != currentPoint) { //if not current point
                    //p2 is this current point
                    const planetPoint = points[key]
                    const vpPp2 = [p2[0] - planetPoint[0], p2[1] - planetPoint[1]]
                    const distanceP = vectorLength(vpPp2);
                    const force = 1 / distanceP ** 2;
                    const Gx = vpPp2[0] / distanceP * force;
                    const Gy = vpPp2[1] / distanceP * force;
                    sumAccell(currentPoint, [Gx, Gy], antigravityFactor)
                }
            }

            //spring force
            const longitudEnReposo = 1;
            const p1p2Distancia = distanceBtw2Points(p1, p2);
            const p1p2Normalizado = [(p2[0] - p1[0]) / p1p2Distancia, (p2[1] - p1[1]) / p1p2Distancia];
            const elasticForce = (p1p2Distancia - longitudEnReposo) / 2
            if (parentPoint == 0) {
                sumAccell(currentPoint, [-(p1p2Normalizado[0] * elasticForce * 2), -(p1p2Normalizado[1] * elasticForce * 2)], springFactor)
            } else {
                sumAccell(currentPoint, [-(p1p2Normalizado[0] * elasticForce), -(p1p2Normalizado[1] * elasticForce)], springFactor)
                sumAccell(parentPoint, [(p1p2Normalizado[0] * elasticForce), (p1p2Normalizado[1] * elasticForce)], springFactor)
            }
        })

        //console.log(accelArray)

        //calculate velocity from accelArray
        accelArray.forEach((acclVector, nodeID) => {
            //console.log(acclVector, nodeID);
            const currentV = velArray[nodeID];
            const cVx = currentV[0];
            const cVy = currentV[1];
            const cAx = acclVector[0];
            const cAy = acclVector[1];
            const Vx = cVx + cAx * timeStep;
            const Vy = cVy + cAy * timeStep;
            velArray[nodeID] = [Vx, Vy]
        })

        //console.log(velArray);

        //calculate position from velArray 
        velArray.forEach((velVector, nodeID) => {
            if (nodeID != 0) {
                const currentP = points[nodeID];
                const Px = currentP[0];
                const Py = currentP[1];
                const Vx = velVector[0];
                const Vy = velVector[1];
                const x = Px + (Vx * timeStep);
                const y = Py + (Vy * timeStep);
                pointsArray[nodeID] = [x, y]
                const parentPoint = pointsArray[findParentOf(nodeID, graph)]
                linesArray[nodeID] = calcularEcuacionDeDosIncognitas([parentPoint[0], 1, parentPoint[1], x, 1, y]);
            }
        })

        return [pointsArray, linesArray, velArray]
    }

    function runPhysics() {
        //console.log('📐 Run physics!');
        function initializeVelocities(ps) {
            var vs = []
            for (var key in ps) {
                vs[key] = [0, 0]
            }
            return vs
        }
        if (velocities.length !== points.length) {
            setVelocities(initializeVelocities(points))
        } else {
            const [ps, ls, vs] = physics(points, line, velocities, G)
            setPoints(ps);
            setLines(ls);
            setVelocities(vs);
        }
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
            const pointX = -point[1] * zoom + xOffset;
            const pointY = point[0] * zoom + yOffset;
            //console.log(pointY);
            reactCode.push(
                <Node key={node + "n"} node={node} type={nType[node]} data={nData[node]} top={pointX} left={pointY} />
            )
            try {
                if (node !== 0) {
                    const parentNode = findParentOf(node, G);
                    const linkY1 = points[parentNode][0] * zoom + yOffset + 25;
                    const linkX1 = -points[parentNode][1] * zoom + xOffset + 25;
                    const linkX2 = pointX + 25;
                    const linkY2 = pointY + 25;
                    const length = Math.sqrt((linkX2 - linkX1) ** 2 + (linkY2 - linkY1) ** 2)
                    const angle = Math.acos((linkY2 - linkY1) / length)
                    var angleInDeg = (angle / Math.PI * 180);
                    if (linkX2 - linkX1 < 0) angleInDeg = -(angle / Math.PI * 180)
                    // console.log(`[${parentNode},${node}] Angle in rad: ${angle}; angle in deg: ${angleInDeg}`)
                    reactCode.push(
                        <Link key={node + "l"} width={length} top={linkX1} left={linkY1} rotate={angleInDeg}></Link>
                    )
                }
            } catch (error) {
                // console.error(error)
                console.warn(`Node: "${node}" is an orphan.`)
            }

        })
        return reactCode;
    }

    useEffect(() => {
        //console.log('useEffect');
        if (graphChanged(G, nData)) {
            loaded.current = false;
        }
        if (!loaded.current) {
            // perform BFS algorithm and create the points and links
            // the root node is at (0, 0)
            const [generatedPoints, generatedLines] = generatePointsFromGraph(G);
            setPoints(generatedPoints);
            setLines(generatedLines)

            console.log("🔵 Finished generating points and lines:")
            console.log(generatedPoints)
            console.log(generatedLines);

            loaded.current = true;
        }

        const timer = setInterval(() => {
            console.log(`Second: ${seconds}`)
            runPhysics()
            setSeconds(seconds + 1)
        }, 16);

        return () => clearInterval(timer)
    }, )

    const reactCode = generateReactCode(points)
    //console.log('render')
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
    function data() {
        if (typeof (props.data === 'object')) {
            return JSON.stringify(props.data)
        } else {
            return props.data
        }
    }
    return (
        <div className={style.node} style={nodeStyle}>
            <span>{props.node}</span>
            <div className={style.nodedata} style={{ '--nodeID': `"${props.node}"`, }}>
                <span className={style.nodeTitle}>{props.type}</span>
                <br />
                <p className={style.nData}>{data()}</p>
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