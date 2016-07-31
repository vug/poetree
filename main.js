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
        this.title = 'Untitled';
        this.content = 'Poem here...';
        this.parent = null;
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
            children: childrenJSON
        };
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

test1();

