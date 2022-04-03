import { useState, useEffect } from "react";
import style from './article.module.css';
import { Link } from "react-router-dom";
import settings from "./settings";
import GraphViewer from "./graphViewer";

export default function Article(props) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${settings.apiURL}/src/${props.article}`)
            .then(response => {
                if (response.ok) {
                    return response.text()
                }
                throw response;
            })
            .then(data => {
                setData(data);
            })
            .catch(error => {
                console.error('Error fetching article:' + error);
                setError(error);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [props.article])

    if (loading) return <article className={style.article}>Loading...</article>;
    if (error) return <article className={style.article}>Error downloading article</article>

    console.log(data)

    function findParentOf(node, graph) {
        const LinksArray = graph.slice(2);
        for (var index = 1; index < LinksArray.length; index += 2) {
            if (LinksArray[index] === node) return LinksArray[index - 1];
        }
    }

    const G = [1, 0,]; //kantenliste
    const nD = [0];
    const nT = ['root'];

    function parser(markdown, graph, nodeData, nodeType, h) {
        const newlineSpetialCharacters = ['# ', '##', '- ', '* ', '``', '![', '--', '**', '> '];
        function getNodesCount() { return graph[0] };
        function updateNodesLinksCount() {
            const linksArray = graph.slice(2);
            const linksCount = linksArray.length / 2;
            graph[0] = linksCount + 1;
            graph[1] = linksCount;
        }

        function isLineImage(line) {
            var isImage = true;
            if (line.slice(0, 2) !== '![') isImage = false //if starts with ![
            //bellow checks order of things
            if (line.indexOf('!') > line.indexOf('[')) isImage = false;
            if (line.indexOf('[') > line.indexOf(']')) isImage = false;
            if (line.indexOf(']') > line.indexOf('(')) isImage = false;
            if (line.indexOf('(') > line.indexOf(')')) isImage = false;
            if (line.slice(line.indexOf(')')) !== ')') isImage = false; //if there's anything after )
            return isImage
        }

        function isLineHeading(beforeFirstWhiteSpace) {
            var isHeading = true;
            for (const key in beforeFirstWhiteSpace) {
                if (beforeFirstWhiteSpace[key] !== '#') isHeading = false;
            }
            return isHeading
        }

        function isLineOlListItem(input) {
            const beforeSpace = input.split(' ', 1)[0]
            if (isNaN(beforeSpace * 1)) return false
            if (beforeSpace.slice(-1) !== '.') return false
            return true
        }

        function handleLineWithSpetialCharacters(line, rootNode) {
            const beforeFirstWhiteSpace = line.split(' ', 1)[0];
            if (isLineOlListItem(line)) { //if its a number ending with .
                //console.warn(`${line} is ol`)
                const olRootNode = createNode('OrderedList', 0, rootNode);
                var listLinesCount = 0;
                var lastListItemNode = null;
                for (const i in markdown) {
                    const currentLineFirstCharacter = markdown[i][0];
                    if (!isLineOlListItem(markdown[i]) &&
                        currentLineFirstCharacter !== ' ' &&
                        markdown[i] !== '') break //if line doesn't start with a number and it's not white space, and it's not a blank line
                    listLinesCount += 1;
                }
                for (var i = 0; i < listLinesCount; i++) { //for all of the lines that are part of the list
                    const listItem = markdown[i];
                    if (listItem[0] === ' ') { //if starts with white space
                        // find all following lines that start with spaces, 
                        var linesWithSpaces = [];
                        for (var j = 0; j < listLinesCount; j++) {
                            try {
                                const nextLine = markdown[i + j];
                                //if (isLineOlListItem(nextLine)) break
                                if (nextLine[0] !== ' ' && nextLine !== '') break // if nextLine doesn't start with space and nextLine is not blank line
                            } catch (error) {
                                console.warn(error)
                                console.warn('error parsing lines with sapces ')
                                break;
                            }
                            linesWithSpaces.push(markdown[i + j])
                        }
                        i = i + j - 1; //skip lines with spaces
                        // calculate the number of spaces of the first line, 
                        var spacesCount = 0;
                        for (const key in listItem) { //for each letter in the first line that starts with spaces
                            if (listItem[key] === ' ') {
                                spacesCount += 1;
                            } else {
                                break;
                            }
                        }
                        // slice it from all the lines and 
                        linesWithSpaces = linesWithSpaces.map((value) => {
                            return value.slice(spacesCount);
                        })
                        //console.log('💥')
                        //console.log(linesWithSpaces)
                        // parse them as another markdown document
                        const G = [1, 0,]; //kantenliste
                        const nD = [0];
                        const nT = ['root'];
                        const [childMarkdown, childGraph, childNodeData, childNodeType] = parser(linesWithSpaces, G, nD, nT, h);
                        // console.log('🎗️')
                        // console.log(childGraph);
                        // console.log(childNodeData);
                        // console.log(childNodeType);
                        // merge it to the current graph and nodedata and nodetype
                        const newNodesToMergeCount = childGraph[0] - 1;
                        var childNodesMapping = { 0: lastListItemNode };
                        for (var k = 1; k <= newNodesToMergeCount; k++) {
                            if (findParentOf(k, childGraph) === 0) { //parent of the node in the child graph is the root of the child graph
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[0])
                                childNodesMapping[k] = newNode;
                            } else {
                                const parentOfChild = findParentOf(k, childGraph);
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[parentOfChild])
                                childNodesMapping[k] = newNode;
                            }
                        }
                    } else { //starts with number
                        if (listItem !== '') {
                            lastListItemNode = createNode('listItem', listItem.slice(listItem.indexOf(' ') + 1), olRootNode)
                        }
                    }
                }
                consumeLine(listLinesCount);
            } else if (isLineImage(line)) { //block image
                function extractSource(input) {
                    var src = input.substring(line.indexOf('(') + 1, line.indexOf(')')); //between ( and )
                    src = src.replace(' ', ''); //remove white spaces
                    if (src.indexOf('"') !== -1) { //if src contains "
                        src = src.slice(0, src.indexOf('"')) //take only before "
                    }
                    if (src.slice(0, 4) === 'http') return src //if starts with http leave as is
                    return src.slice(src.lastIndexOf('/') + 1) //otherwise take only what's after /
                }
                const imgProperties = {
                    src: extractSource(line),
                    alt: line.substring(line.indexOf('[') + 1, line.indexOf(']')),
                    title: line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')),
                }
                createNode('Image', imgProperties, rootNode);
                consumeLine(1);
            } else if (isLineHeading(beforeFirstWhiteSpace)) {  //headings or title
                const text = line.slice(beforeFirstWhiteSpace.length + 1); //remove #s from text
                switch (beforeFirstWhiteSpace.length) {
                    case 1:
                        createNode('Title', text, rootNode);
                        break;
                    case 2:
                        createNode('H2', text, rootNode);
                        break;
                    case 3:
                        createNode('H3', text, rootNode);
                        break;
                    default:
                        createNode('H4', text, rootNode);
                        break;
                }
                consumeLine(1);
            } else if (beforeFirstWhiteSpace === '-' || beforeFirstWhiteSpace === '*') { //ul
                //console.warn(line + ' is ul');
                const ulRootNode = createNode('UnorderedList', 0, rootNode);
                var listLinesCount = 0;
                var lastListItemNode = null;
                for (const i in markdown) {
                    const currentLineFirstCharacter = markdown[i][0];
                    const first2Characters = markdown[i].slice(0, 2);
                    if (first2Characters !== '- ' &&
                        first2Characters !== '* ' &&
                        first2Characters !== '  ') break //if line doesn't start with - * or white space
                    listLinesCount += 1;
                }
                for (var i = 0; i < listLinesCount; i++) { //for all of the lines that are part of the list
                    const listItem = markdown[i];
                    if (listItem[0] === ' ') { //if starts with white space
                        // find all following lines that start with spaces, 
                        var linesWithSpaces = [];
                        for (var j = 0; j < listLinesCount; j++) {
                            try {
                                const nextLine = markdown[i + j];
                                if (nextLine[0] !== ' ') break
                            } catch (error) {
                                console.warn(error)
                                console.warn('error parsing lines with sapces ')
                                break;
                            }
                            linesWithSpaces.push(markdown[i + j])
                        }
                        i = i + j - 1; //skip lines with spaces
                        // calculate the number of spaces of the first line, 
                        var spacesCount = 0;
                        for (const key in listItem) { //for each letter in the first line that starts with spaces
                            if (listItem[key] === ' ') {
                                spacesCount += 1;
                            } else {
                                break;
                            }
                        }
                        // slice it from all the lines and 
                        linesWithSpaces = linesWithSpaces.map((value) => {
                            return value.slice(spacesCount);
                        })
                        //console.log('💥')
                        //console.log(linesWithSpaces)
                        // parse them as another markdown document
                        const G = [1, 0,]; //kantenliste
                        const nD = [0];
                        const nT = ['root'];
                        const [childMarkdown, childGraph, childNodeData, childNodeType] = parser(linesWithSpaces, G, nD, nT, h);
                        // console.log('🎗️')
                        // console.log(childGraph);
                        // console.log(childNodeData);
                        // console.log(childNodeType);
                        // merge it to the current graph and nodedata and nodetype
                        const newNodesToMergeCount = childGraph[0] - 1;
                        var childNodesMapping = { 0: lastListItemNode };
                        for (var k = 1; k <= newNodesToMergeCount; k++) {
                            if (findParentOf(k, childGraph) === 0) { //parent of the node in the child graph is the root of the child graph
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[0])
                                childNodesMapping[k] = newNode;
                            } else {
                                const parentOfChild = findParentOf(k, childGraph);
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[parentOfChild])
                                childNodesMapping[k] = newNode;
                            }
                        }
                    } else { //starts with - or *
                        lastListItemNode = createNode('listItem', listItem.slice(2), ulRootNode)
                    }
                }
                consumeLine(listLinesCount);
            } else if (line.slice(0, 3) === '```') { //code block
                var codeLinesCount = 0;
                for (const i in markdown) {
                    if (i > 0 && markdown[i].slice(0, 3) === '```') break //if not first line and line starts with ```
                    codeLinesCount += 1;
                }
                createNode('Codeblock', markdown.slice(1, codeLinesCount), rootNode)
                consumeLine(codeLinesCount + 1);
            } else if (line.slice(0, 2) === '> ') { //blockquote
                var blockquoteLinesCount = 0;
                const bqRootNode = createNode('Blockquote', 0, rootNode);
                for (const i in markdown) {
                    if (i > 0 && markdown[i].slice(0, 1) !== '>') break
                    blockquoteLinesCount += 1;
                }
                var bqLinesArray = markdown.slice(0, blockquoteLinesCount);
                bqLinesArray = bqLinesArray.map((value) => { //value is each unaltered line of the blockquote
                    var out = value.slice(1); //remove first char: >
                    //console.log(out);
                    for (const charI in out) { //for every character in out
                        if (out[charI] === ' ') out = out.slice(1); //remove if it's white space
                        break //go on if it's not a white space
                    }
                    //console.log(out);
                    return out
                })
                //console.log(bqLinesArray);
                // throw the lines of the block quote to be parsed again
                const G = [1, 0,]; //kantenliste
                const nD = [0];
                const nT = ['root'];
                const [childMarkdown, childGraph, childNodeData, childNodeType] = parser(bqLinesArray, G, nD, nT, h);
                // merge it to the current graph and nodedata and nodetype
                const newNodesToMergeCount = childGraph[0] - 1;
                var childNodesMapping = { 0: bqRootNode };
                for (var k = 1; k <= newNodesToMergeCount; k++) {
                    if (findParentOf(k, childGraph) === 0) { //parent of the node in the child graph is the root of the child graph
                        const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[0])
                        childNodesMapping[k] = newNode;
                    } else {
                        const parentOfChild = findParentOf(k, childGraph);
                        const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[parentOfChild])
                        childNodesMapping[k] = newNode;
                    }
                }
                consumeLine(blockquoteLinesCount);
            } else if (line === '---' || line === "***") { //hr
                createNode('Hr', 0, rootNode)
                consumeLine(1)
            } else {
                console.error(`Error handling line with spetial characters at line: ${line}`)
                consumeLine(1);
            }
        }

        function createNode(type, content, parentNode) {
            const newNodeNumber = getNodesCount();
            graph.push(parentNode);
            graph.push(newNodeNumber);
            nodeData[newNodeNumber] = content;
            nodeType[newNodeNumber] = type;
            updateNodesLinksCount();
            return newNodeNumber;
        }

        function consumeLine(quantity) {
            markdown = markdown.slice(quantity);
        }

        function processLine(line, rootNode) {
            if (line === '') {
                consumeLine(1)
                return
            }
            const firstTwoCharacters = line.slice(0, 2);
            if (newlineSpetialCharacters.includes(firstTwoCharacters) || (isLineOlListItem(line) && firstTwoCharacters !== '  ')) {
                handleLineWithSpetialCharacters(line, rootNode)
                // console.log('spetial chars: ' + line)
            } else {
                createNode('Paragraph', line, rootNode);
                consumeLine(1);
            };
        }

        function copyArray(input) {
            let output = [];
            let key;
            for (key in input) {
                output[key] = input[key];
            }
            return output;
        }

        var lineCount = 0
        while (markdown.length > 0) { //process until there's no more lines
            // console.log('🟡 Progress:');
            // console.log(`line:${lineCount}`);
            // console.log(`line:${markdown[0]}`)
            // console.log(markdown);
            // console.log(graph);
            // console.log(nodeData);
            // console.log(nodeType);
            h[h.counter] = {
                md: markdown,
                currLine: markdown[0],
                g: copyArray(graph),
                nData: copyArray(nodeData),
                nType: copyArray(nodeType),
            };
            h.counter += 1;
            processLine(markdown[0], 0);
            lineCount += 1;
        }

        //inline parser, take into acount the recursion 
        const dataLength = nodeData.length;
        for (var node = 0; node < dataLength; node++) {
            const type = nodeType[node];
            const data = nodeData[node];
            if (type.slice(0, 2) !== "Il" && typeof (data) === 'string') { //if type of current node doesn't start with "Il" (inline), and the data is a string
                console.log(`To be parsed by inline parser: ${data}`);
                nodeData[node] = 0;
                console.log(`created node:${createNode('IlText', data, node)}`)
            }
        }

        return [markdown, graph, nodeData, nodeType, h]
    }

    const [mdsrc, tree, treeContents, treeTags, histry] = parser(data.replaceAll('\t', '  ').split('\n'), G, nD, nT, { counter: 0, }); //replace all tabs with 9 spaces and create and array wheren each item is a line of the markdown document
    console.log('🟢 Results:');
    console.log(mdsrc);
    console.log(tree);
    console.log(treeContents);
    console.log(treeTags);
    console.log('🟡 Results:');
    console.log(histry)

    function renderArticle(graph, nodeData, nodeType, root) {
        // var res = [];
        // for (const key in graph) {
        //     res.push(<Text key={key} text={graph[key]}></Text>);
        // }
        // return res

        //create array nodes of every node connected to root
        var links = graph.slice(2);
        var nodes = [];
        var inlineNodes = [];
        for (var i = 1; i < links.length; i += 2) {
            if (links[i - 1] === root) { //if the parent of i is the current root
                const nodeToBeRendered = links[i] // links[i] is the node that we want to use
                if (nodeType[nodeToBeRendered].slice(0, 2) !== 'Il') { //if this node isn't an inline node
                    nodes.push(nodeToBeRendered)
                } else { //is an inline node
                    inlineNodes.push(nodeToBeRendered);
                }
            }
        }
        nodes = inlineNodes.concat(nodes)

        console.log(`Child nodes being generated: ${nodes}`)

        const code = nodes.map((value) => { //value is the node number
            switch (nodeType[value]) {
                case 'Title':
                    return <Title key={value} text={renderArticle(graph, nodeData, nodeType, value)}></Title>

                case 'Paragraph':
                    return <Paragraph key={value} content={renderArticle(graph, nodeData, nodeType, value)}></Paragraph>

                case 'listItem':
                    return <ListItem key={value} text={renderArticle(graph, nodeData, nodeType, value)}></ListItem>

                case 'UnorderedList':
                    return <UnorderedList key={value} list={renderArticle(graph, nodeData, nodeType, value)}></UnorderedList>

                case 'OrderedList':
                    return <OrderedList key={value} list={renderArticle(graph, nodeData, nodeType, value)}></OrderedList>

                case 'Codeblock':
                    return <Codeblock key={value} code={nodeData[value]}></Codeblock>

                case 'Image':
                    return <Image key={value} src={nodeData[value].src} alt={nodeData[value].alt} title={nodeData[value].title}></Image>

                case 'H2':
                    return <H2 key={value} text={renderArticle(graph, nodeData, nodeType, value)}></H2>

                case 'H3':
                    return <H3 key={value} text={renderArticle(graph, nodeData, nodeType, value)}></H3>

                case 'H4':
                    return <H4 key={value} text={renderArticle(graph, nodeData, nodeType, value)}></H4>

                case 'Hr':
                    return <Hr key={value}></Hr>

                case 'Blockquote':
                    return <Blockquote key={value} quote={renderArticle(graph, nodeData, nodeType, value)}></Blockquote>

                case 'IlSmall':
                    return <IlSmall key={value} text={nodeData[value]} />

                case 'IlCode':
                    return <IlCode key={value} code={nodeData[value]} />

                case "IlText":
                    return <IlText key={value} text={nodeData[value]} />

                default:
                    console.error(`Unknown data type: ${nodeType[value]}`)
                    return <IlText key={value} text={nodeData[value]} />
            }
        })
        return code;
    }

    return (
        <article className={style.article}>
            <GraphViewer graph={tree} nodesData={treeContents} nodesType={treeTags} />
            {renderArticle(tree, treeContents, treeTags, 0)}
        </article>
    );
}

function Title(props) {
    return (
        <h1 className={style.h1}>{props.text}</h1>
    );
}

function H2(props) {
    return (
        <h2 className={style.h2}>{props.text}</h2>
    );
}

function H3(props) {
    return (
        <h3 className={style.h3}>{props.text}</h3>
    );
}

function H4(props) {
    return (
        <h4 className={style.h4}>{props.text}</h4>
    );
}

function OrderedList(props) {
    return (
        <ol className={style.ol}>
            {props.list}
        </ol>
    );
}

function UnorderedList(props) {
    return (
        <ul className={style.ul}>
            {props.list}
        </ul>
    );
}

function ListItem(props) {
    return <li className={style.li}>{props.text}</li>
}

function Paragraph(props) {
    return (
        <p className={style.p}>{props.content}</p>
    );
}

function IlText(props) {
    return (
        <span className={style.span}>{props.text}</span>
    );
}

function IlSmall(props) {
    return (
        <small className={style.small}>{props.text}</small>
    );
}

function IlCode(props) {
    return (
        <code className={style.code}>{props.code}</code>
    );
}

function Codeblock(props) {
    return (
        <div className={style.code}>
            <code>
                {props.code.map((value, index) => { return <pre key={index}>{value}<br /></pre> })}
            </code>
        </div>
    );
}

function Blockquote(props) {
    return (
        <blockquote className={style.bq}>
            {props.quote}
        </blockquote>
    )
}

function Image(props) {
    function setSrc(src) {
        if (src.slice(0, 7) === "http://" || src.slice(0, 8) === "https://") return src
        return `${settings.mediaURL}/${src}`
    }
    return (
        <img src={setSrc(props.src)} alt={props.alt} title={props.title} className={style.img}></img>
    )
}

function Hr() {
    return <hr />
}