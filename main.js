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
        var id = 1;
        var visNodes = [];
        var visEdges = [];

        this.traverse(function(node) {
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

        network.on('click', function(properties) {
            var selectedNodeId = properties.nodes;
            var selectedNode = null;
            root.traverse(function(node) {
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

class Poetree {
    constructor() {
        this.poems = [];
    }

    addPoem() {
        var poemRoot = new Node();
        this.poems.push(poemRoot);
    }
}

function print(x) {
    console.log(x);
}

function test1() {
    poetree = new Poetree();
    poetree.addPoem();
    poem1 = poetree.poems[0];
    poem1.content = "To be or not to be";
    poem1.createCloneChild();
    poem1_1 = poem1.children[0];

    poetree.poems[0].traverse(print);
}

function test2() {
    works = [
        {
            title: "Flowers Are Red",
            content: "Some flowers are red,\nSome are violet,\nSugar is sweet,\nAnd so are you.",
            createdAt: "Sun, 31 Jul 2016 22:51:00 GMT",
            children: [
                        {
                            title: "Flowers Are Red",
                            content: "Roses are red,\nViolets are violet,\nSugar is sweet,\nAnd so are you.",
                            createdAt: "Sun, 31 Jul 2016 22:55:00 GMT",
                            children: [
                                {
                                    title: "Roses Are Red",
                                    content: "Roses are red,\nViolets are blue,\nSugar is sweet,\nAnd so are you.",
                                    createdAt: "Sun, 31 Jul 2016 22:55:00 GMT",
                                    children: []
                                }]
                        },
                        {
                            title: "Flowers Are Colored",
                            content: "Some flowers are red,\nSome are violet,\nSugar is sweet,\nAnd so are you.",
                            createdAt: "Sun, 31 Jul 2016 22:56:00 GMT",
                            children: []
                        }
            ]
        }
    ];

    poem1 = works[0];
    poem1Str = JSON.stringify(poem1);
    root = Node.convertJSON2Node(JSON.parse(poem1Str));
    root.visualize();
    textArea = document.getElementById('texteditor');
    console.log(root);
}

// test1();
test2();

