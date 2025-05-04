// Roads and Graph Construction
var roads = [
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
function buildGraph(edges) {
    var graph = Object.create(null);
    function addEdge(from, to) {
        if (!graph[from])
            graph[from] = [];
        graph[from].push(to);
    }
    for (var _i = 0, _a = edges.map(function (r) { return r.split('-'); }); _i < _a.length; _i++) {
        var _b = _a[_i], from = _b[0], to = _b[1];
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}
var roadGraph = buildGraph(roads);
// VillageState
var VillageState = /** @class */ (function () {
    function VillageState(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }
    VillageState.prototype.move = function (destination) {
        var _this = this;
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        else {
            var parcels = this.parcels
                .map(function (p) {
                if (p.place !== _this.place)
                    return p;
                return { place: destination, address: p.address };
            })
                .filter(function (p) { return p.place !== p.address; });
            return new VillageState(destination, parcels);
        }
    };
    VillageState.random = function (parcelCount) {
        if (parcelCount === void 0) { parcelCount = 5; }
        var parcels = [];
        for (var i = 0; i < parcelCount; i++) {
            var address = randomPick(Object.keys(roadGraph));
            var place = void 0;
            do {
                place = randomPick(Object.keys(roadGraph));
            } while (place === address);
            parcels.push({ place: place, address: address });
        }
        return new VillageState('Post Office', parcels);
    };
    return VillageState;
}());
function randomPick(array) {
    var choice = Math.floor(Math.random() * array.length);
    return array[choice];
}
function randomRobot(state) {
    return { direction: randomPick(roadGraph[state.place]) };
}
function runRobot(state, robot, memory) {
    for (var turn = 0;; turn++) {
        if (state.parcels.length === 0) {
            console.log("Robot finished the job! Turns taken: ".concat(turn));
            break;
        }
        var action = robot(state, memory);
        state = state.move(action.direction);
        // console.log(`Moved to: ${action.direction}`);
    }
}
runRobot(VillageState.random(), randomRobot, []);
// ----- Exercises #1 -----
function runRobotCount(state, robot, memory) {
    var _a;
    var turn = 0;
    for (;; turn++) {
        if (state.parcels.length === 0)
            break;
        var action = robot(state, memory);
        state = state.move(action.direction);
        memory = (_a = action.memory) !== null && _a !== void 0 ? _a : [];
    }
    return turn;
}
function compareRobots(robot1, memory1, robot2, memory2) {
    var total1 = 0, total2 = 0;
    for (var i = 0; i < 100; i++) {
        var task = VillageState.random();
        total1 += runRobotCount(task, robot1, memory1);
        total2 += runRobotCount(task, robot2, memory2);
    }
    console.log("Robot 1 average turns: ".concat(total1 / 100));
    console.log("Robot 2 average turns: ".concat(total2 / 100));
}
function findRoute(graph, from, to) {
    var work = [{ at: from, route: [] }];
    for (var i = 0; i < work.length; i++) {
        var _a = work[i], at = _a.at, route = _a.route;
        var _loop_1 = function (place) {
            if (place === to)
                return { value: route.concat(place) };
            if (!work.some(function (w) { return w.at === place; })) {
                work.push({ at: place, route: route.concat(place) });
            }
        };
        for (var _i = 0, _b = graph[at]; _i < _b.length; _i++) {
            var place = _b[_i];
            var state_1 = _loop_1(place);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    return [];
}
var mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall",
    "Daria's House", "Ernie's House", "Grete's House", "Shop", "Grete's House",
    "Farm", "Marketplace", "Post Office"
];
function routeRobot(state, memory) {
    if (memory.length === 0) {
        memory = mailRoute;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}
function goalOrientedRobot(state, memory) {
    if (memory.length === 0) {
        var parcel = state.parcels[0];
        if (parcel.place !== state.place) {
            memory = findRoute(roadGraph, state.place, parcel.place);
        }
        else {
            memory = findRoute(roadGraph, state.place, parcel.address);
        }
    }
    return { direction: memory[0], memory: memory.slice(1) };
}
compareRobots(routeRobot, [], goalOrientedRobot, []);
// ----- #2 -----
function lazyRobot(state, memory) {
    if (memory.length === 0) {
        var routes = state.parcels.map(function (parcel) {
            if (parcel.place !== state.place) {
                return {
                    route: findRoute(roadGraph, state.place, parcel.place),
                    pickUp: true,
                };
            }
            else {
                return {
                    route: findRoute(roadGraph, state.place, parcel.address),
                    pickUp: false,
                };
            }
        });
        function score(option) {
            return (option.pickUp ? 0.5 : 0) - option.route.length;
        }
        memory = routes.reduce(function (a, b) { return (score(a) > score(b) ? a : b); }).route;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}
compareRobots(goalOrientedRobot, [], lazyRobot, []);
// ----- #3 -----
var PGroup = /** @class */ (function () {
    function PGroup(members) {
        this.members = members;
    }
    PGroup.prototype.add = function (value) {
        if (this.has(value))
            return this;
        return new PGroup(this.members.concat([value]));
    };
    PGroup.prototype.delete = function (value) {
        if (!this.has(value))
            return this;
        return new PGroup(this.members.filter(function (m) { return m !== value; }));
    };
    PGroup.prototype.has = function (value) {
        return this.members.includes(value);
    };
    PGroup.empty = new PGroup([]);
    return PGroup;
}());
var a = PGroup.empty.add('a');
var ab = a.add('b');
var b = ab.delete('a');
console.log(a.has('a'));
console.log(ab.has('b'));
console.log(b.has('a'));
console.log(a.has('b'));
