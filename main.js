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

    visualize() {

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
            var idx = parseInt(selectPoem.value);
            this.visualizeTree(this.poems[idx]);
        });

        var textArea = document.getElementById('texteditor');
        textArea.onkeyup = e => {
            var selectedPoemId = this.network.getSelectedNodes()[0];
            var text = textArea.value;
            var textSplitted = text.split("\n\n");
            var title = textSplitted[0];
            var content = textSplitted[1];

            var idx = parseInt(selectPoem.value);
            var selectedNode = this.poems[idx].findId(selectedPoemId);
            selectedNode.title = title;
            selectedNode.content = content;
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

        // initialize your network!
        this.network = new vis.Network(container, data, options);

        this.network.on('click', function (properties) {
            var selectedNodeId = properties.nodes;
            var selectedNode = poem.findId(selectedNodeId);
            if (selectedNode) {
                var textArea = document.getElementById('texteditor');
                textArea.value = selectedNode.title + "\n\n" + selectedNode.content;
            }
        });
    }
}

function test1() {
    poetree = new Poetree();
    poetree.addPoem();
    poem1 = poetree.poems[0];
    poem1.content = "To be or not to be";
    poem1.createCloneChild();
    poem1_1 = poem1.children[0];

    var print = function (x) {
        console.log(x);
    };
    poetree.poems[0].traverse(print);
}

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function main() {
    var poetree = new Poetree();

    // UI
    var inputFile = document.getElementById("inputUploadFile");
    inputFile.addEventListener("change", handleFiles, false);
    
    var buttonSave = document.getElementById("buttonSaveFile");
    buttonSave.addEventListener("click", function() {
        var jsonString = JSON.stringify(poetree.poems);
        //console.log(jsonString);
        download(jsonString, "works.json", "text/plain");
    });

    function handleFiles() {
        var fileList = this.files;
        var reader = new FileReader();
        reader.onload = function () {
            var fileContent = reader.result;
            var works = JSON.parse(fileContent);
            poetree.loadWorksJSON(works);
            poetree.visualizeTree(poetree.poems[0]);
        };
        reader.readAsText(fileList[0]);
    }
}

// test1();
main();

