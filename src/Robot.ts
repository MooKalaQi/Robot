// Types
type RoadGraph = { [key: string]: string[] };
type Parcel = { place: string; address: string };
type RobotAction = { direction: string; memory?: string[] };
type Robot = (state: VillageState, memory: string[]) => RobotAction;

// Roads and Graph Construction
const roads: string[] = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall",
];

function buildGraph(edges: string[]): RoadGraph {
  let graph: RoadGraph = Object.create(null);
  function addEdge(from: string, to: string) {
    if (!graph[from]) graph[from] = [];
    graph[from].push(to);
  }
  for (let [from, to] of edges.map(r => r.split('-'))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph: RoadGraph = buildGraph(roads);

// VillageState
class VillageState {
  place: string;
  parcels: Parcel[];

  constructor(place: string, parcels: Parcel[]) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination: string): VillageState {
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

  static random(parcelCount: number = 5): VillageState {
    let parcels: Parcel[] = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place: string;
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place === address);
      parcels.push({ place, address });
    }
    return new VillageState('Post Office', parcels);
  }
}

function randomPick<T>(array: T[]): T {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state: VillageState): RobotAction {
  return { direction: randomPick(roadGraph[state.place]) };
}

function runRobot(state: VillageState, robot: Robot, memory: string[]): void {
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

runRobot(VillageState.random(), randomRobot, []);

// ----- Exercises #1 -----
function runRobotCount(state: VillageState, robot: Robot, memory: string[]): number {
  let turn = 0;
  for (; ; turn++) {
    if (state.parcels.length === 0) break;
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory ?? [];
  }
  return turn;
}

function compareRobots(
  robot1: Robot, memory1: string[],
  robot2: Robot, memory2: string[]
): void {
  let total1 = 0, total2 = 0;
  for (let i = 0; i < 100; i++) {
    let task = VillageState.random();
    total1 += runRobotCount(task, robot1, memory1);
    total2 += runRobotCount(task, robot2, memory2);
  }
  console.log(`Robot 1 average turns: ${total1 / 100}`);
  console.log(`Robot 2 average turns: ${total2 / 100}`);
}

function findRoute(graph: RoadGraph, from: string, to: string): string[] {
  let work: { at: string, route: string[] }[] = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place === to) return route.concat(place);
      if (!work.some(w => w.at === place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
  return [];
}

const mailRoute: string[] = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall",
  "Daria's House", "Ernie's House", "Grete's House", "Shop", "Grete's House",
  "Farm", "Marketplace", "Post Office"
];

function routeRobot(state: VillageState, memory: string[]): RobotAction {
  if (memory.length === 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}

function goalOrientedRobot(state: VillageState, memory: string[]): RobotAction {
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

compareRobots(routeRobot, [], goalOrientedRobot, []);

// ----- #2 -----
function lazyRobot(state: VillageState, memory: string[]): RobotAction {
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
    function score(option: { route: string[], pickUp: boolean }) {
      return (option.pickUp ? 0.5 : 0) - option.route.length;
    }
    memory = routes.reduce((a, b) => (score(a) > score(b) ? a : b)).route;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
compareRobots(goalOrientedRobot, [], lazyRobot, []);

// ----- #3 -----
class PGroup<T> {
  members: T[];
  constructor(members: T[]) {
    this.members = members;
  }

  add(value: T): PGroup<T> {
    if (this.has(value)) return this;
    return new PGroup(this.members.concat([value]));
  }

  delete(value: T): PGroup<T> {
    if (!this.has(value)) return this;
    return new PGroup(this.members.filter(m => m !== value));
  }

  has(value: T): boolean {
    return this.members.includes(value);
  }

  static empty = new PGroup<any>([]);
}

let a = PGroup.empty.add('a');
let ab = a.add('b');
let b = ab.delete('a');

console.log(a.has('a'));
console.log(ab.has('b'));
console.log(b.has('a'));
console.log(a.has('b'));