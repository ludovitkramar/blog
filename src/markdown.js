import { useState, useEffect } from "react";
import style from './markdown.module.css';
import { Link } from "react-router-dom";
import settings from "./settings";
import GraphViewer from "./graphViewer";

export default function Markdown(props) {
    const [mdsrc, setmdsrc] = useState()
    const [tree, settree] = useState()
    const [treeContents, settreeContents] = useState()
    const [treeTags, settreeTags] = useState()
    const [histry, sethistry] = useState()
    const [loading, setLoading] = useState(true)
    const data = props.markdown;
    const displayGraphTop = props.graphTop;
    const displayGraphBottom = props.graphBottom;

    useEffect(() => {
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
                if (line.slice(0, 2) !== '![') return false //if starts with ![
                //bellow checks order of things
                if (line.indexOf('!') > line.indexOf('[')) return false;
                if (line.indexOf('[') > line.indexOf(']')) return false;
                if (line.indexOf(']') > line.indexOf('(')) return false;
                if (line.indexOf('(') > line.indexOf(')')) return false;
                if (line.slice(line.indexOf(')')) !== ')') return false; //if there's anything after )
                return true
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
                    var codeLines = markdown.slice(1, codeLinesCount);
                    for (const line in codeLines) {
                        if (codeLines[line].slice(0, 4) === "\\```") codeLines[line] = codeLines[line].slice(1);
                    }
                    createNode('Codeblock', codeLines, rootNode)
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
                    createNode("Paragraph", line, rootNode)
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
            const spetialInlineSymbols = ['<', '`'];
            function findNextPosOfChar(string, position, char) {
                //string is the string in which to find the char
                // position is from where start to look
                // char is what we are looking for

                // \ escape character should be ignored if it is before what is being searched.

                //console.log("[||] We are looking in:" + string);
                for (var i = position + 1; i < string.length; i++) { //starting from next of position in string
                    //console.log("[||]" + string[i]);
                    const c = string[i] //current char
                    if (c === '\\') {
                        i += 1
                    } else if (c === char) {
                        //console.log(`[||] at ${i}, ${c} has been found`);
                        return i //return position where next char is in string
                    }
                }
                console.log(`[||] couldn't find char`);
                return -1 //hasn't been found
            }

            function findNextPosOfString(string, position, input) { //string is where to look, input is what to look for, position is from where start to look
                //returns position where input starts in string after position
                var newString = string.slice(position + 1)
                const newStringCopy = newString
                console.log(newString)
                var indexOfInput = newString.indexOf(input)
                while (newStringCopy[indexOfInput - 1] === '\\') {
                    newString = string.slice(indexOfInput + 3)
                    console.log(newString)
                    indexOfInput += newString.indexOf(input) + 1
                }
                if (indexOfInput < 0) return -1 //couldn't find it 
                return indexOfInput + position + 1
            }

            for (var node = 0; node < dataLength; node++) { //for every non inline node 
                const type = nodeType[node];
                const data = nodeData[node];
                if (type.slice(0, 2) !== "Il" && typeof (data) === 'string') { //if type of current node doesn't start with "Il" (inline), and the data is a string
                    function parseIlString(data, node) {
                        console.log(`To be parsed by inline parser: ${data}`);
                        var output = "";
                        var outpuType = "IlText" //default type is inline text
                        for (var charID = 0; charID < data.length; charID++) { //for every char in the string data
                            const c = data[charID] //the current char
                            switch (c) {
                                case '!':
                                    if (data[charID + 1] === '[') { //if next char is [
                                        if (output.length > 0) createNode(outpuType, output, node); //store text until this point
                                        output = "";
                                        //process inline image
                                        outpuType = "IlImage"
                                        const posOfEndAltText = findNextPosOfChar(data, charID, ']')
                                        if (posOfEndAltText === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break;
                                        }
                                        const altText = data.substring(charID + 2, posOfEndAltText);
                                        const startPosOfSrc = findNextPosOfChar(data, charID, '(')
                                        if (startPosOfSrc === -1 || startPosOfSrc !== posOfEndAltText + 1) { // ( should be right after ]
                                            outpuType = "IlText"
                                            output += c
                                            break;
                                        }
                                        const endPosOfSrc = findNextPosOfChar(data, charID, ')')
                                        if (endPosOfSrc === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break;
                                        }
                                        const srcText = data.substring(startPosOfSrc + 1, endPosOfSrc)
                                        function extractsrcTitle(input) {
                                            var src = input;
                                            src = src.replace(' ', ''); //remove white spaces
                                            if (src.indexOf('"') !== -1) { //if src contains "
                                                var h = src.slice(0, src.indexOf('"')) //take only before "
                                                var t = src.slice(src.indexOf('"') + 1, src.lastIndexOf('"'))
                                                if (h.slice(0, 4) === 'http') return [h, t]
                                                h = h.slice(h.lastIndexOf('/') + 1)
                                                return [h, t]
                                            } else {
                                                return [input, null]
                                            }
                                        }
                                        const srcTitle = extractsrcTitle(srcText);
                                        const imgObj = {
                                            'src': srcTitle[0],
                                            'title': srcTitle[1],
                                            'alt': altText
                                        }

                                        createNode(outpuType, imgObj, node);
                                        charID = endPosOfSrc //skip to after code 
                                        break;
                                    } else {
                                        //treat as normal text
                                        outpuType = "IlText"
                                        output += c
                                        break;
                                    }
                                case '[':
                                    if (output.length > 0) createNode(outpuType, output, node); //store text until this point
                                    output = "";
                                    //process inline link
                                    outpuType = "IlLink"
                                    const nextEndBracketPos = findNextPosOfChar(data, charID, ']')
                                    const nextStartBracketPos = findNextPosOfChar(data, charID, '[');
                                    var endPosLinkText = nextEndBracketPos;
                                    if (nextStartBracketPos > 0 && nextStartBracketPos < nextEndBracketPos) { //if there's an image inside the link text
                                        endPosLinkText = findNextPosOfChar(data, nextEndBracketPos, ']')
                                    }
                                    if (endPosLinkText === -1) {
                                        outpuType = "IlText"
                                        output += c
                                        break;
                                    }
                                    const linkText = data.substring(charID + 1, endPosLinkText);
                                    const startPosOfHref = findNextPosOfChar(data, endPosLinkText, '(')
                                    if (startPosOfHref === -1 || startPosOfHref !== endPosLinkText + 1) { // ( should be right after ]
                                        outpuType = "IlText"
                                        output += c
                                        break;
                                    }
                                    const endPosOfHref = findNextPosOfChar(data, endPosLinkText, ')')
                                    if (endPosOfHref === -1) {
                                        outpuType = "IlText"
                                        output += c
                                        break;
                                    }
                                    const hrefText = data.substring(startPosOfHref + 1, endPosOfHref)

                                    function extractHrefTitle(input) {
                                        var src = input;
                                        src = src.replace(' ', ''); //remove white spaces
                                        if (src.indexOf('"') !== -1) { //if src contains "
                                            var h = src.slice(0, src.indexOf('"')) //take only before "
                                            var t = src.slice(src.indexOf('"') + 1, src.lastIndexOf('"'))
                                            return [h, t]
                                        } else {
                                            return [input, input]
                                        }
                                    }
                                    const hrefTitle = extractHrefTitle(hrefText);
                                    const linkObj = {
                                        'href': hrefTitle[0],
                                        'title': hrefTitle[1],
                                    }

                                    const myNode = createNode(outpuType, linkObj, node);
                                    parseIlString(linkText, myNode)
                                    charID = endPosOfHref //skip to after code 
                                    break;
                                case '`':
                                    //store normal text
                                    if (output.length > 0) createNode(outpuType, output, node); //console.log(`[||] created node:${createNode(outpuType, output, node)}`)
                                    output = "";
                                    //process inline code
                                    outpuType = "IlCode" //set output type
                                    const nextPosOfChar = findNextPosOfChar(data, charID, '`')
                                    if (nextPosOfChar === -1) {
                                        outpuType = "IlText"
                                        output += c
                                        break
                                    }
                                    //console.log('[||]' + data[nextPosOfChar]);
                                    output = data.substring(charID + 1, nextPosOfChar)
                                    const outLength = output.length
                                    const lastTwoChars = output.substring(outLength - 2, outLength)
                                    if (lastTwoChars === '\\\\') { //escaped escape char before the end of code sample
                                        output = output.slice(0, outLength - 1)
                                    }
                                    output = output.replaceAll('\\`', '`')
                                    output = output.replaceAll('\\\\`', '\\`')
                                    //console.log('[||] output:' + output);
                                    //console.log(`[||] created node:${createNode(outpuType, output, node)}`)
                                    createNode(outpuType, output, node)
                                    charID = nextPosOfChar //skip to after code 
                                    output = ""; //reset output
                                    break;
                                case '\\':
                                    outpuType = "IlText"
                                    output += data[charID + 1] //add next char to output
                                    charID += 1 //dont process next char
                                    break

                                case '<':
                                    //store normal text
                                    if (output.length > 0) createNode(outpuType, output, node) //console.log(`created node:${createNode(outpuType, output, node)}`)
                                    output = "";
                                    if (data.substring(charID, '<small>'.length + charID) === '<small>') { //if whats found is <small>
                                        //process inline small text
                                        outpuType = "IlSmall"
                                        const nextPosOfString = findNextPosOfString(data, charID, '</small>')
                                        if (nextPosOfString === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 7, nextPosOfString)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfString + 7
                                        output = ""; //reset output
                                        break;
                                    } else { //if whats found was nothing spetial
                                        // process normal link, or mailto link
                                        outpuType = "IlLink" //set output type
                                        const nextPosOfChar = findNextPosOfChar(data, charID, '>')
                                        if (nextPosOfChar === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 1, nextPosOfChar)
                                        const linkObject = {
                                            'href': output,
                                            'title': output,
                                        }
                                        const myNode = createNode(outpuType, linkObject, node);
                                        outpuType = "IlText" //set output type
                                        createNode(outpuType, output, myNode); // the text
                                        charID = nextPosOfChar //skip to after code 
                                        output = ""; //reset output
                                        break;
                                    }
                                case '*':
                                    //store normal text
                                    if (output.length > 0) createNode(outpuType, output, node) //console.log(`created node:${createNode(outpuType, output, node)}`)
                                    output = "";
                                    //process bold , italic or both
                                    if (data[charID + 1] === "*" && data[charID + 2] === "*") { //bold and italic
                                        //console.log('[||] Bold and italic: ' + data)
                                        outpuType = "IlBold";
                                        const nextPosOfString = findNextPosOfString(data, charID, '***')
                                        if (nextPosOfString === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 3, nextPosOfString)
                                        const boldNode = createNode(outpuType, 0, node)
                                        outpuType = "IlItalic";
                                        const myNode = createNode(outpuType, output, boldNode);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfString + 2
                                        output = ""; //reset output
                                        break;
                                    } else if (data[charID + 1] === "*") { //bold
                                        //console.log('[||] Bold: ' + data)
                                        outpuType = "IlBold"
                                        const nextPosOfString = findNextPosOfString(data, charID, '**')
                                        if (nextPosOfString === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 2, nextPosOfString)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfString + 1
                                        output = ""; //reset output
                                        break;
                                    } else { //italic
                                        //console.log('[||] Italic: ' + data)
                                        outpuType = "IlItalic" //set output type
                                        const nextPosOfChar = findNextPosOfChar(data, charID, '*')
                                        if (nextPosOfChar === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 1, nextPosOfChar)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfChar //skip to after code 
                                        output = ""; //reset output
                                        break;
                                    }
                                case '=': //mark text
                                    if (data[charID + 1] === "=") {
                                        //store normal text
                                        if (output.length > 0) createNode(outpuType, output, node) //console.log(`created node:${createNode(outpuType, output, node)}`)
                                        output = "";
                                        outpuType = "IlMark"
                                        const nextPosOfString = findNextPosOfString(data, charID, '==')
                                        if (nextPosOfString === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 2, nextPosOfString)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfString + 1
                                        output = ""; //reset output
                                        break;
                                    } else {
                                        outpuType = "IlText"
                                        output += c
                                        break;
                                    }
                                case '~': //strikethrough or subscript
                                    //store normal text
                                    if (output.length > 0) createNode(outpuType, output, node)
                                    output = "";
                                    if (data[charID + 1] === "~") { //strikethrough
                                        outpuType = "IlStrikethrough"
                                        const nextPosOfString = findNextPosOfString(data, charID, '~~')
                                        if (nextPosOfString === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 2, nextPosOfString)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfString + 1
                                        output = ""; //reset output
                                        break;
                                    } else { //italic
                                        outpuType = "IlSubscript" //set output type
                                        const nextPosOfChar = findNextPosOfChar(data, charID, '~')
                                        if (nextPosOfChar === -1) {
                                            outpuType = "IlText"
                                            output += c
                                            break
                                        }
                                        output = data.substring(charID + 1, nextPosOfChar)
                                        const myNode = createNode(outpuType, output, node);
                                        parseIlString(output, myNode);
                                        charID = nextPosOfChar //skip to after code 
                                        output = ""; //reset output
                                        break;
                                    }
                                case '^':
                                    //store normal text
                                    if (output.length > 0) createNode(outpuType, output, node)
                                    output = "";
                                    outpuType = "IlSuperscript" //set output type
                                    const nextPosOfChar2 = findNextPosOfChar(data, charID, '^')
                                    if (nextPosOfChar2 === -1) {
                                        outpuType = "IlText"
                                        output += c
                                        break
                                    }
                                    output = data.substring(charID + 1, nextPosOfChar2)
                                    const myNode2 = createNode(outpuType, output, node);
                                    parseIlString(output, myNode2);
                                    charID = nextPosOfChar2 //skip to after code 
                                    output = ""; //reset output
                                    break;
                                default:
                                    outpuType = "IlText"
                                    output += c
                                    break;
                            }
                        }
                        if (output.length > 0) createNode(outpuType, output, node) //console.log(`created node:${createNode(outpuType, output, node)}`)
                        //nodeData[node] = 0;
                        if (nodeType[node].slice(0, 2) !== "Il") nodeData[node] = 0;
                        // const createdNodeID = createNode('IlText', data, node)
                        // console.log(`created node:${createdNodeID}`)
                    }
                    parseIlString(data, node)
                }
            }

            return [markdown, graph, nodeData, nodeType, h]
        }

        const [mdsrcTemp, treeTemp, treeContentsTemp, treeTagsTemp, histryTemp] = parser(data.replaceAll('\t', '  ').split('\n'), G, nD, nT, { counter: 0, }); //replace all tabs with 2 spaces and create and array wheren each item is a line of the markdown document
        setmdsrc(mdsrcTemp);
        settree(treeTemp);
        settreeContents(treeContentsTemp);
        settreeTags(treeTagsTemp);
        sethistry(histryTemp);
        setLoading(false);

        console.log('🟢 Results:');
        console.log(mdsrc);
        console.log(tree);
        console.log(treeContents);
        console.log(treeTags);
        console.log('🟡 Results:');
        console.log(histry)

    }, [data])

    if (loading) return <span>Parsing markdown...</span>

    function renderMarkdown(graph, nodeData, nodeType, root) {
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
            var data = nodeData[value]
            // if (typeof (data) === 'string') { //remove the escape character from all text
            //     data = data.replaceAll('\\', '')
            // }
            switch (nodeType[value]) {
                case 'Title':
                    return <Title key={value} text={renderMarkdown(graph, nodeData, nodeType, value)}></Title>

                case 'Paragraph':
                    return <Paragraph key={value} content={renderMarkdown(graph, nodeData, nodeType, value)}></Paragraph>

                case 'listItem':
                    return <ListItem key={value} text={renderMarkdown(graph, nodeData, nodeType, value)}></ListItem>

                case 'UnorderedList':
                    return <UnorderedList key={value} list={renderMarkdown(graph, nodeData, nodeType, value)}></UnorderedList>

                case 'OrderedList':
                    return <OrderedList key={value} list={renderMarkdown(graph, nodeData, nodeType, value)}></OrderedList>

                case 'Codeblock':
                    return <Codeblock key={value} code={data}></Codeblock>

                case 'Image':
                    return <Image key={value} src={data.src} alt={data.alt} title={data.title}></Image>

                case 'H2':
                    return <H2 key={value} text={renderMarkdown(graph, nodeData, nodeType, value)}></H2>

                case 'H3':
                    return <H3 key={value} text={renderMarkdown(graph, nodeData, nodeType, value)}></H3>

                case 'H4':
                    return <H4 key={value} text={renderMarkdown(graph, nodeData, nodeType, value)}></H4>

                case 'Hr':
                    return <Hr key={value}></Hr>

                case 'Blockquote':
                    return <Blockquote key={value} quote={renderMarkdown(graph, nodeData, nodeType, value)}></Blockquote>

                case 'IlSmall':
                    return <IlSmall key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case 'IlCode':
                    return <IlCode key={value} code={data} />

                case "IlItalic":
                    return <IlItalic key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlBold":
                    return <IlBold key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlText":
                    return <IlText key={value} text={data} />

                case "IlLink":
                    return <IlLink key={value} href={data.href} title={data.title} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlImage":
                    return <IlImage key={value} src={data.src} alt={data.alt} title={data.title}></IlImage>

                case "IlMark":
                    return <IlMark key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlSubscript":
                    return <IlSubscript key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlSuperscript":
                    return <IlSuperscript key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                case "IlStrikethrough":
                    return <IlStrikethrough key={value} text={renderMarkdown(graph, nodeData, nodeType, value)} />

                default:
                    console.error(`Unknown data type: ${nodeType[value]}`)
                    return <IlText key={value} text={data} />
            }
        })
        return code;
    }

    function renderGraph(bool) {
        if (bool) return <GraphViewer graph={tree} nodesData={treeContents} nodesType={treeTags}></GraphViewer>
        return
    }

    return (
        <>
            {renderGraph(displayGraphTop)}
            {renderMarkdown(tree, treeContents, treeTags, 0)}
            {renderGraph(displayGraphBottom)}
        </>
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
    return <hr className={style.hr} />
}

function IlItalic(props) {
    return (
        <em className={style.i}>{props.text}</em>
    )
}

function IlBold(props) {
    return (
        <strong className={style.b}>{props.text}</strong>
    )
}

function IlLink(props) {
    var href = props.href;
    if (href.slice(0, 4) !== "http") {
        if (href[0] === '#') {
            return <a href={href} title={props.title} className={style.a}>{props.text}</a>
        } else if (href.indexOf('@') !== -1) {//if it has an @ , mailto
            href = `mailto:${href}`;
        } else { //internal link to other article
            return <Link to={'/article/' + href} title={props.title} className={style.a}>{props.text}</Link>
        }
    }
    return (
        <a href={href} title={props.title} target="_blank" rel="noreferrer" className={style.a}>{props.text}</a>
    )
}

function IlImage(props) {
    function setSrc(src) {
        if (src.slice(0, 7) === "http://" || src.slice(0, 8) === "https://") return src
        return `${settings.mediaURL}/${src}`
    }
    return (
        <img src={setSrc(props.src)} alt={props.alt} title={props.title} className={style.IlImage}></img>
    )
}

function IlMark(props) {
    return (
        <mark className={style.mark}>{props.text}</mark>
    )
}

function IlStrikethrough(props) {
    return (
        <s className={style.strike}>{props.text}</s>
    )
}

function IlSubscript(props) {
    return (
        <sub className={style.sub}>{props.text}</sub>
    )
}

function IlSuperscript(props) {
    return (
        <sup className={style.sup}>{props.text}</sup>
    )
}