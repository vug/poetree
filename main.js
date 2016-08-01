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
        for (var idx = 0; idx < poetree.poems.length; idx++) {
            var poem = poetree.poems[idx];
            var option = document.createElement('option');
            option.value = idx;
            option.innerHTML = poem.title;
            selectPoem.appendChild(option);
        }

        selectPoem.addEventListener("change", function (event) {
            var idx = parseInt(selectPoem.value);
            poetree.visualizeTree(poetree.poems[idx]);
        });
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
        var network = new vis.Network(container, data, options);

        network.on('click', function (properties) {
            var selectedNodeId = properties.nodes;
            var selectedNode = null;
            poem.traverse(function (node) {
                if (node.id == selectedNodeId) {
                    selectedNode = node;
                }
            });
            if (selectedNode) {
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

function test2() {
    poem1Str = JSON.stringify(poem1);
    root = Node.convertJSON2Node(JSON.parse(poem1Str));

    textArea = document.getElementById('texteditor');
    console.log(root);

    poetree = new Poetree();
    poetree.loadWorksJSON(works);
    poetree.visualizeTree(poetree.poems[0]);

    // UI

    var inputFile = document.getElementById("inputUploadFile");
    inputFile.addEventListener("change", handleFiles, false);
    function handleFiles() {
        var fileList = this.files;
        /* now you can work with the file list */
        var reader = new FileReader();
        reader.onload = function () {
            var fileContent = reader.result;
        };
        reader.readAsText(fileList[0]);
    }
}

// test1();
test2();

