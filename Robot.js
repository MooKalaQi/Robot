const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  'Marketplace-Farm',
  'Marketplace-Post Office',
  'Marketplace-Shop',
  'Marketplace-Town Hall',
  'Shop-Town Hall',
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (!graph[from]) graph[from] = [];
    graph[from].push(to);
  }
  for (let [from, to] of edges.map(r => r.split('-'))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels
        .map(p => {
          if (p.place !== this.place) return p;
          return { place: destination, address: p.address };
        })
        .filter(p => p.place !== p.address);
      return new VillageState(destination, parcels);
    }
  }

  static random(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place === address);
      parcels.push({ place, address });
    }
    return new VillageState('Post Office', parcels);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Robot finished the job! Turns taken: ${turn}`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    // console.log(`Moved to: ${action.direction}`);
  }
}

runRobot(VillageState.random(), randomRobot);

//exersices #1
function runRobotCount(state, robot, memory) {
  let turn = 0;
  for (; ; turn++) {
    if (state.parcels.length === 0) break;
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
  return turn;
}

function compareRobots(robot1, memory1, robot2, memory2) {
  let total1 = 0,
    total2 = 0;
  for (let i = 0; i < 100; i++) {
    let task = VillageState.random();
    total1 += runRobotCount(task, robot1, memory1);
    total2 += runRobotCount(task, robot2, memory2);
  }
  console.log(`Robot 1 average turns: ${total1 / 100}`);
  console.log(`Robot 2 average turns: ${total2 / 100}`);
}
function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place === to) return route.concat(place);
      if (!work.some(w => w.at === place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

function routeRobot(state, memory) {
  if (memory.length === 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
function goalOrientedRobot(state, memory) {
  if (memory.length === 0) {
    let parcel = state.parcels[0];
    if (parcel.place !== state.place) {
      memory = findRoute(roadGraph, state.place, parcel.place);
    } else {
      memory = findRoute(roadGraph, state.place, parcel.address);
    }
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
const mailRoute = [
  "Alice's House",
  'Cabin',
  "Alice's House",
  "Bob's House",
  'Town Hall',
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  'Shop',
  "Grete's House",
  'Farm',
  'Marketplace',
  'Post Office',
];

function routeRobot(state, memory) {
  if (memory.length === 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
compareRobots(routeRobot, [], goalOrientedRobot, []);

//#2
function lazyRobot(state, memory) {
  if (memory.length === 0) {
    let routes = state.parcels.map(parcel => {
      if (parcel.place !== state.place) {
        return {
          route: findRoute(roadGraph, state.place, parcel.place),
          pickUp: true,
        };
      } else {
        return {
          route: findRoute(roadGraph, state.place, parcel.address),
          pickUp: false,
        };
      }
    });
    function score({ route, pickUp }) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    memory = routes.reduce((a, b) => (score(a) > score(b) ? a : b)).route;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
compareRobots(goalOrientedRobot, [], lazyRobot, []);

//#3
class PGroup {
  constructor(members) {
    this.members = members;
  }

  add(value) {
    if (this.has(value)) return this;
    return new PGroup(this.members.concat([value]));
  }

  delete(value) {
    if (!this.has(value)) return this;
    return new PGroup(this.members.filter(m => m !== value));
  }

  has(value) {
    return this.members.includes(value);
  }
}

PGroup.empty = new PGroup([]);
let a = PGroup.empty.add('a');
let ab = a.add('b');
let b = ab.delete('a');

console.log(a.has('a'));
console.log(ab.has('b'));
console.log(b.has('a'));
console.log(a.has('b'));
