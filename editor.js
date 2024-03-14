class Editor {

    #cursorPosition = -1;

    /**
     * Create a editor
     * @param {string} id - id from div with contenteditable
     */
    constructor(id) {
        this.src_div = document.getElementById(id)
        this.id = id

        this.#init();
    }

    #init() {
        /** @type {HTMLDivElement} */
        const editor = document.getElementById(this.id)
        editor.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
            e.preventDefault();
            if (e.key === "h") {
                console.log(this.#getCursorPosititon(editor));
            } else if (e.key === "g") {
                // console.log(this.#getCursorPosititon(editor));
                this.#setCursorPosition(this.#getCursorPosititon(editor), 5);
            } else if (e.key === "f") {
                let cursorPosition = this.#getCursorPosititon(editor);
                this.#node_walker(cursorPosition.root, cursorPosition.curPos + 1, cursorPosition.curNode);
            }
        })
    }

    /**
     * @typedef {object} CursorPosition
     * @property {number} curPos
     * @property {Node} curNode
     * @property {number} parentHop
     * @property {HTMLDivElement} root
     * @property {number} lastNodeSize
     */

    /**
     * 
     * @param {HTMLDivElement} root
     * @returns {CursorPosition}
     */
    #getCursorPosititon(root) {
        let sel = window.getSelection();
        if (!root.contains(sel.anchorNode) && !root.contains(sel.focusNode)) {
            return undefined
        } else {
            let curPos = sel.anchorOffset;
            // console.log("log curPos: ",curPos);
            let node = sel.anchorNode;
            let parentHop = 0;
            let lastNodeSize = curPos;
            while (node) {
                if (node === root) {
                    break;
                }
                if (node.previousSibling) {
                    node = node.previousSibling;
                    curPos += node.textContent.length;
                    lastNodeSize = curPos;
                } else {
                    node = node.parentNode;
                    parentHop++;
                    if (node === null) {
                        break;
                    }
                }
            }
            return { curPos: curPos, curNode: node, parentHop: parentHop, root: sel.anchorNode, lastNodeSize: lastNodeSize };
        }
    }


    /**
     * @typedef CurrentRange
     * @property {number} pos
     * @property {Node} node
     * @property {Range} [range] 
    */

    /**
     * Creates a range given a node and a position
     * @param {CurrentRange} currentRange
     * @returns {Range}
     */
    #createRange(currentRange) {
        if (!currentRange.range) {
            currentRange.range = document.createRange();
            currentRange.range.selectNode(currentRange.node);
            currentRange.range.setStart(currentRange.node, 0);     
        }

        if (currentRange.pos === 0) {
            currentRange.range.setEnd(currentRange.node, currentRange.pos);
        } else if (currentRange.node && currentRange.pos > 0) {
            console.log("[DEBUG] current node: ", currentRange.node);
            if (currentRange.node.nodeType === Node.TEXT_NODE) {
                console.log("[DEBUG] NODE TYPE: ", currentRange.node.nodeType);
                if (currentRange.node.textContent.length < currentRange.pos) {
                    console.log("[DEBUG] TEXT CONTENT: ", currentRange.node.textContent.length);
                    currentRange.pos -= currentRange.node.textContent.length;
                }else {
                    currentRange.range.setEnd(currentRange.node, currentRange.pos);
                    currentRange.pos = 0;
                }
            } else {
                /*
                if (currentRange.node.childNodes === undefined) {
                    throw new console.error("childnodes is really undefined");
                }
                console.log("[DEBUG] current childnodes: ", currentRange.node.childNodes);
                for (let cn = 0; cn < currentRange.node.childNodes.length; cn++) {
                    currentRange = this.#createRange({ pos: currentRange.node.childNodes[cn], node: currentRange.pos, range: currentRange.range });

                    console.log("[DEBUG] pos: ", currentRange.pos.length);
                    if (currentRange.pos === 0) {
                        break;
                    }
                }
                */
            }
        }

        return currentRange;
    }

    /**
     * 
     * @param {Node} node 
     * @param {Number} pos
     * @param {Node} fNode 
     */
    #node_walker(node, pos, fNode) {
        let selection = window.getSelection();
        let range = document.createRange();
        let root = node;
        while (node !== fNode) {
            if (node.firstChild !== null && node.firstChild !== undefined) {
                node = node.firstChild;
                pos -= node.textContent.length;
            } else if (node.nextSibling !== null && node.nextSibling !== undefined) {
                node = node.nextSibling;
                pos -= node.textContent.length;
            } else if (
                node.parentNode !== null && node.parentNode.nextSibling !== null &&
                node.parentNode !== undefined && node.parentNode.nextSibling !== undefined
            ) {
                node = node.parentNode.nextSibling;
                pos -= node.textContent.length;
            } else {
                if (node.parentNode === root) {
                    break;
                }
                while (node !== root) {
                    if (
                        node.parentNode !== null && node.parentNode.nextSibling !== null &&
                        node.parentNode !== undefined && node.parentNode.nextSibling !== undefined
                    ) {
                        node = node.parentNode.nextSibling;
                        break;
                    } else if (
                        node.parentNode !== root && node.parentNode !== undefined && node.parentNode !== null
                    ) {
                        node = node.parentNode
                    }
                }

            }
        }
        range.setStart(node, pos);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * 
     * @param {CursorPosition} cursorPosition
     * @param {number} [increment] 
     */
    #setCursorPosition(cursorPosition) {
        console.log("[DEBUG] Cursor Position: ", cursorPosition);
        if (cursorPosition.curPos >= 0) {
            let selection = window.getSelection();
            /** @type {CurrentRange} */
            let currentRange;
            currentRange = this.#createRange({ pos: cursorPosition.curPos + 1, node: cursorPosition.root });            

            if (currentRange.range) {
                currentRange.range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(currentRange.range);
            }
        }
    }

    #move() {

    }
}

export { Editor };