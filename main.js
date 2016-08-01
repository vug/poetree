class Serial {
    constructor() {
        this.num = 0;
    }

    getNext() {
        this.num += 1;
        return this.num;
    }
}

class Node {
    constructor() {
        this.title = "Untitled";
        this.content = "Poem here...";
        this.parent = null;
        this.createdAt = null;
        this.children = [];
    };

    addChild(child) {
        this.children.push(child);
        child.setParent(this);
    }

    setParent(parent) {
        this.parent = parent;
    }

    createCloneChild() {
        var child = new Node();
        child.content = this.content;
        child.title = this.title;
        this.addChild(child);
    }

    traverse(process) {
        process(this);
        for (var child of this.children) {
            child.traverse(process);
        }
    }

    findId(id) {
        var nodeWithId = null;
        this.traverse(function (node) {
            if (node.id == id) {
                nodeWithId = node;
            }
        });
        return nodeWithId;
    }

    toJSON() {
        var childrenJSON = [];
        for (var child of this.children) {
            childrenJSON.push(child.toJSON());
        }
        return {
            title: this.title,
            content: this.content,
            createdAt: this.createdAt,
            children: childrenJSON,
        };
    }

    static convertJSON2Node(json) {
        var node = new Node();
        node.title = json.title;
        node.content = json.content;
        node.createdAt = json.createdAt;
        for (var child of json.children) {
            var childNode = Node.convertJSON2Node(child);
            node.addChild(childNode);
        }
        return node;
    }
}

class Poetree {
    constructor() {
        this.poems = [];
        this.network = null;
    }

    addPoem() {
        var poemRoot = new Node();
        this.poems.push(poemRoot);
    }

    getSelectedPoemIdx() {
        var selectPoem = document.getElementById("selectPoemList");
        var idx = parseInt(selectPoem.value);
        return idx;
    }

    loadWorksJSON(worksJson) {
        this.poems = [];
        for (var poemJson of worksJson) {
            var poemRootNode = Node.convertJSON2Node(poemJson);
            this.poems.push(poemRootNode);
        }

        var selectPoem = document.getElementById("selectPoemList");
        selectPoem.innerHTML = "";
        for (var idx = 0; idx < this.poems.length; idx++) {
            var poem = this.poems[idx];
            var option = document.createElement('option');
            option.value = idx;
            option.innerHTML = poem.title;
            selectPoem.appendChild(option);
        }

        selectPoem.addEventListener("change", event => {
            var idx = this.getSelectedPoemIdx();
            this.visualizeTree(this.poems[idx]);
            var textArea = document.getElementById('texteditor');
            textArea.value = "";
        });

        var textArea = document.getElementById('texteditor');
        textArea.onkeyup = e => {
            var selectedPoemId = this.network.getSelectedNodes()[0];
            var text = textArea.value;
            var textSplitted = text.split("\n");
            var title = textSplitted[0];
            var content = textSplitted.slice(2).join("\n");

            var idx = this.getSelectedPoemIdx();
            var selectedPoemRoot = this.poems[idx];
            var selectedNode = selectedPoemRoot.findId(selectedPoemId);

            if (selectedNode) {
                selectedNode.title = title;
                selectedNode.content = content;
                this.visualizeTree(selectedPoemRoot);
                this.network.selectNodes([selectedPoemId]);
            }
        };
    }

    visualizeTree(poem) {
        var id = 1;
        var visNodes = [];
        var visEdges = [];

        poem.traverse(function (node) {
            node.id = id;
            visNodes.push({
                id: id,
                label: node.title + "\n\n" + node.content,
                shape: 'box',
                color: {background: 'white'}, // hover (?)
                labelHighlightBold: false,
                font: {size: 10, face: 'monospace', align: 'left'}
            });
            id += 1;
            if (node.parent != null) {
                visEdges.push({from: node.parent.id, to: node.id});
            }
        });

        var nodes = new vis.DataSet(visNodes);
        var edges = new vis.DataSet(visEdges);
        var container = document.getElementById('poemnetwork');

        var data = {
            nodes: nodes,
            edges: edges
        };

        var options = {
            manipulation: false,
            //height: '100%',
            layout: {
                hierarchical: {
                    enabled: true,
                    /* "directed" or "hubsize"
                    docs: hubsize: The node with the most connections (the largest hub) is drawn at the top of the tree.
                    direction: The direction method is based on the direction of the edges.
                     */
                    sortMethod: "directed",
                    levelSeparation: 150
                }
            },
            interaction: {
                hover: true
            }
            // physics: {
            //   hierarchicalRepulsion: {
            //     nodeDistance: 200
            //   }
            // }
        };

        this.network = new vis.Network(container, data, options);

        this.network.on('click', function (properties) {
            var selectedNodeId = properties.nodes;
            var selectedNode = poem.findId(selectedNodeId);
            var textArea = document.getElementById('texteditor');
            if (selectedNode) {
                textArea.value = selectedNode.title + "\n\n" + selectedNode.content;
                textArea.disabled = selectedNode.children.length > 0;
            }
            else {
                textArea.value = "";
                textArea.disabled = true;
            }
        });
    }
}

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function cloneSelected() {
    var root = poetree.poems[poetree.getSelectedPoemIdx()];
    if (!poetree.network) return;
    var id = poetree.network.getSelectedNodes()[0];
    var node = root.findId(id);
    if (node) {
        node.createCloneChild();
        poetree.visualizeTree(root);
    }
}

function main() {
    poetree = new Poetree();

    // UI
    var inputFile = document.getElementById("inputUploadFile");
    var handleFiles = function () {
        var fileList = this.files;
        var reader = new FileReader();
        reader.onload = function () {
            var fileContent = reader.result;
            var works = JSON.parse(fileContent);
            poetree.loadWorksJSON(works);
            poetree.visualizeTree(poetree.poems[0]);
        };
        if (fileList.length > 0) {
            reader.readAsText(fileList[0]);
        }
    };
    inputFile.addEventListener("change", handleFiles, false);

    var buttonSave = document.getElementById("buttonSaveFile");
    buttonSave.addEventListener("click", function() {
        var jsonString = JSON.stringify(poetree.poems);
        download(jsonString, "works.json", "text/plain");
    });

    var buttonClone = document.getElementById("buttonCloneInstance");
    buttonClone.addEventListener("click", cloneSelected);
}

main();
