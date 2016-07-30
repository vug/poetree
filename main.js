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
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.parent = null;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
    child.setParent(this);
  }

  setParent(parent) {
    this.parent = parent;
  }
}

class Instance extends Node {
  createCloneChild(id) {
    var child = new Instance(id, this.val);
    this.addChild(child);
  }
}

class Poetree {
  constructor() {
    this.idSerial = new Serial();
    this.poemRoots = [];
    this.poems = {};
  }

  addPoem() {
    var id = this.idSerial.getNext();
    var poem = new Instance(id, 'abidin');
    this.poemRoots.push(poem);
    this.poems[poem.key] = "Title Here...";
  }
}



function test1() {
  id = 1;
  root = new Node(id, 'abidin');
  id += 1;
  child1 = new Node(id, root.val);
  child1.val = 'abidinim';
  root.addChild(child1);
}

function test2() {
  id = 1;
  root = new Instance(id, 'abidin');
  id += 1;
  root.createCloneChild(id);
  child1 = root.children[0];
}

// test1();
// test2();
// console.log(root);

var poetree = new Poetree();
poetree.addPoem();