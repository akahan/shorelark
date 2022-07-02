import * as sim from "lib-simulation-wasm";
import { Terminal } from "./app/terminal";
import { Viewport } from "./app/viewport";
import "./node_modules/chart.js/dist/chart.js"

/* ---------- */

const terminal = new Terminal(
    document.getElementById("terminal-stdin"),
    document.getElementById("terminal-stdout"),
);

const viewport = new Viewport(
    document.getElementById("viewport"),
);

/**
 * Current simulation.
 *
 * @type {Simulation}
 */
let simulation = new sim.Simulation(sim.Simulation.default_config());

/**
 * Whether the simulation is working or not.
 * Can be modified by the `pause` command.
 *
 * @type {boolean}
 */
let active = true;

/* ---------- */

const config = simulation.config();

terminal.println("  _____ _                    _            _    ");
terminal.println(" / ____| |                  | |          | |   ");
terminal.println("| (___ | |__   ___  _ __ ___| | __ _ _ __| | __");
terminal.println(" \\___ \\| '_ \\ / _ \\| '__/ _ \\ |/ _` | '__| |/ /");
terminal.println(" ____) | | | | (_) | | |  __/ | (_| | |  |   < ");
terminal.println("|_____/|_| |_|\\___/|_|  \\___|_|\\__,_|_|  |_|\\_\\");
terminal.println("");
terminal.println("Simulation of evolution, powered by neural network, genetic algorithm & high-school math.");
terminal.println("");
terminal.println("https://pwy.io/en/posts/learning-to-fly-pt1/");
terminal.println("");
terminal.println("---- About ----");
terminal.println("");
terminal.println("Each triangle represents a bird; each bird has an *eye*, whose eyesight is drawn around the bird, and a *brain* that decides where and how fast the bird should be moving.");
terminal.println("");
terminal.println("Each circle represents a food (pizza, so to say), which birds are meant to find and eat.");
terminal.println("");
terminal.println("All birds start flying with randomized brains, and after 2500 turns (around 40 real-time seconds), birds who managed to eat the most foods are reproduced, and their offspring starts the simulation anew.");
terminal.println("");
terminal.println("Thanks to evolution, every generation gets slightly better at locating the food - almost as if the birds programmed themselves!");
terminal.println("");
terminal.println("(fwiw, this neither a swarm intelligence - as birds don't see each other - nor a boids - as birds are not hard-coded to find the food - simulation; just regular neural network & genetic algorithm magic.)");
terminal.println("");
terminal.println("You can affect the simulation by entering commands in the input at the bottom of this box - for starters, try executing the `train` command a few times (write `t`, press enter, write `t`, press enter etc.) - this fast-forwards the simulation, allowing you to see the birds getting smarter by the second.");
terminal.println("");
terminal.println("Would you like to learn how it works?");
terminal.println("https://pwy.io/en/posts/learning-to-fly-pt1/");
terminal.println("");
terminal.println("Would you like to read the source code?");
terminal.println("https://github.com/Patryk27/shorelark");
terminal.println("");
terminal.println("Have fun!");
terminal.println("");
terminal.println("---- Commands ----");
terminal.println("");
terminal.println("- p / pause");
terminal.println("  Pauses (or resumes) the simulation");
terminal.println("");
terminal.println(`- r / reset [animals=${config.world_animals}] [f=${config.world_foods}] [...]`);
terminal.println("  Starts simulation from scratch with given optional");
terminal.println("  parameters:");
terminal.println("");
terminal.println(`  * a / animals (default=${config.world_animals})`);
terminal.println("    number of animals");
terminal.println("");
terminal.println(`  * f / foods (default=${config.world_foods})`);
terminal.println("    number of foods");
terminal.println("");
terminal.println(`  * n / neurons (default=${config.brain_neurons})`);
terminal.println("    number of brain neurons per each animal");
terminal.println("");
terminal.println(`  * p / photoreceptors (default=${config.eye_cells})`);
terminal.println("    number of eye cells per each animal");
terminal.println("");
terminal.println("  Examples:");
terminal.println("    reset animals=100 foods=100");
terminal.println("    r a=100 f=100");
terminal.println("    r p=3");
terminal.println("");
terminal.println("- (t)rain [how-many-generations]");
terminal.println("  Fast-forwards one or many generations, allowing to");
terminal.println("  observe the learning process faster.");
terminal.println("");
terminal.println("  Examples:");
terminal.println("    train");
terminal.println("    t 5");
terminal.println("");
terminal.println("---- Advanced Tips™ ----");
terminal.println("");
terminal.println("- `reset` can modify *all* of the parameters:");
terminal.println("");
terminal.println("  * r i:integer_param=123 f:float_param=123");
terminal.println("  * r a=200 f=200 f:food_size=0.002");
terminal.println("");
terminal.println("  This is considered advanced, because you'll have");
terminal.println("  to look into the source code to find the names.");
terminal.println("  (https://github.com/Patryk27/shorelark/blob/main/libs/simulation/src/config.rs)");
terminal.println("");
terminal.println("---- Funky scenarios ----");
terminal.println("");
terminal.println("  * r i:ga_reverse=1 f:sim_speed_min=0.003");
terminal.println("    (birdies *avoid* food)");
terminal.println("");
terminal.println("  * r i:brain_neurons=1");
terminal.println("    (single-neuroned zombies)");
terminal.println("");
terminal.println("  * r f:food_size=0.05");
terminal.println("    (biiiigie birdies)");
terminal.println("");
terminal.println("  * r f:eye_fov_angle=0.45");
terminal.println("    (narrow field of view)");
terminal.println("");
terminal.println("----");
terminal.scrollToTop();

/* ---------- */

terminal.onInput((input) => {
    terminal.println("");
    terminal.println("$ " + input);

    try {
        exec(input);
    } catch (err) {
        terminal.println(`  ^ err: ${err}`);
    }
});

function exec(input) {
    if (input.includes("[") || input.includes("]")) {
        throw "square brackets are just for documentation purposes - you don't have to write them, e.g.: reset animals=100";
    }

    const [cmd, ...args] = input.split(" ");

    if (cmd === "p" || cmd === "pause") {
        execPause(args);
        return;
    }

    if (cmd === "r" || cmd === "reset") {
        execReset(args);
        return;
    }

    if (cmd === "t" || cmd === "train") {
        execTrain(args);
        return;
    }

    throw "unknown command";
}

function execPause(args) {
    if (args.length > 0) {
        throw "this command accepts no parameters";
    }

    active = !active;
}

function execReset(args) {
    let config = sim.Simulation.default_config();

    for (const arg of args) {
        const [argName, argValue] = arg.split("=");

        if (argName.startsWith("i:")) {
            config[argName.slice(2)] = parseInt(argValue);
        } else if (argName.startsWith("f:")) {
            config[argName.slice(2)] = parseFloat(argValue);
        } else {
            switch (argName) {
                case "a":
                case "animals":
                    config.world_animals = parseInt(argValue);
                    break;

                case "f":
                case "foods":
                    config.world_foods = parseInt(argValue);
                    break;

                case "n":
                case "neurons":
                    config.brain_neurons = parseInt(argValue);
                    break;

                case "p":
                case "photoreceptors":
                    config.eye_cells = parseInt(argValue);
                    break;

                default:
                    throw `unknown parameter: ${argName}`;
            }
        }
    }

    simulation = new sim.Simulation(config);
}

function execTrain(args) {
    if (args.length > 1) {
        throw "this command accepts at most one parameter";
    }

    const generations = args.length == 0 ? 1 : parseInt(args[0]);

    for (let i = 0; i < generations; i += 1) {
        if (i > 0) {
            terminal.println("");
        }

        const stats = simulation.train();
        terminal.println(stats);
    }
}

let speedup = 1;

var slider = document.getElementById("simulation_speed_slider");
var output = document.getElementById("simulation_speed");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  speedup = this.value;
}
/* ---------- */

function redraw() {
    if (active) {
        for (let i = 0; i < speedup; i += 1) {
            let stats = simulation.step();
            let min = stats.min();
            let avg = stats.avg();
            let max = stats.max();
            if (min != null && avg != null && max != null) {
                new_generation(stats)
            }
            let cur = stats.age()
            let max_generation = stats.generation_length()
            set_progressbar(cur, max_generation)
        }
    }

    const config = simulation.config();
    const world = simulation.world();

    viewport.clear();

    for (const food of world.foods) {
        viewport.drawCircle(
            food.x,
            food.y,
            (config.food_size / 2.0),
            'rgb(0, 255, 128)',
        );
    }

    for (const animal of world.animals) {
        viewport.drawTriangle(
            animal.x,
            animal.y,
            config.food_size,
            animal.rotation,
            'rgb(255, 255, 255)',
        );

        const anglePerCell = config.eye_fov_angle / config.eye_cells;

        for (let cellId = 0; cellId < config.eye_cells; cellId += 1) {
            const angleFrom = (animal.rotation - config.eye_fov_angle / 2.0) + (cellId * anglePerCell);
            const angleTo = angleFrom + anglePerCell;
            const energy = animal.vision[cellId];

            viewport.drawArc(
                animal.x,
                animal.y,
                (config.food_size * 2.5),
                angleFrom,
                angleTo,
                `rgba(0, 255, 128, ${energy})`,
            );
        }
    }

    requestAnimationFrame(redraw);
}

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

const ctx = document.getElementById('stats').getContext('2d');
const min = [];
const avg = [];
const max = [];

const chart_config = {
    type: 'line',
    data: {
        datasets: [
            {
                borderColor: CHART_COLORS.green,
                backgroundColor: CHART_COLORS.green,
                borderWidth: 1,
                radius: 0,
                data: max,
                label: 'max',
                order: 2,
            },
            {
                borderColor: CHART_COLORS.blue,
                backgroundColor: CHART_COLORS.blue,
                borderWidth: 1,
                radius: 0,
                data: avg,
                label: 'avg',
                order: 1,
            },
            {
                borderColor: CHART_COLORS.red,
                backgroundColor: CHART_COLORS.red,
                borderWidth: 1,
                radius: 0,
                data: min,
                label: 'min',
                order: 0,
            }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            axis: 'x',
            intersect: false
        },
        plugins: {
            legend: {
                title: {
                    display: true,
                    text: 'Fitness statistics',
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Generation",
                },
                type: 'linear',
                min: 0,
                suggestedMax: 1,
            },
            y: {
                title: {
                    display: true,
                    text: "Fitness",
                },
                min: 0,
                suggestedMax: 100,
            }
        }
    }
};

const myChart = new Chart(ctx, chart_config)
let generation = 1;

function addGeneration(chart, label, stats) {
    chart.data.labels.push(label);

    chart.data.datasets[2].data.push(stats.min());
    chart.data.datasets[1].data.push(stats.avg());
    chart.data.datasets[0].data.push(stats.max());
    chart.data.datasets.forEach(dataset => {
        dataset.fill = 'start';
    });
    let generation = stats.generation();
    if (generation < 50) {
        chart.options.scales.x.min = 0;
    } else {
        chart.options.scales.x.min = generation - 50;
    }
    chart.options.scales.x.max = generation;
    chart.update();
}

function new_generation(stats) {
    addGeneration(myChart, generation, stats)
    generation += 1
    set_progressbar(0, stats.generation_length)
}



document.getElementById('train').onclick = function () {
    const stats = simulation.train();
    new_generation(stats)
}

var init_stat = {
    'min': function () { return 0; },
    'avg': function () { return 0; },
    'max': function () { return 0; },
    'age': function () { return 0; },
    'generation': function () { return 0; },
};
addGeneration(myChart, 0, init_stat)

var i = 0;
function set_progressbar(cur, max) {
    var elem = document.getElementById("generationBar");
    var percentage = (cur * 100) / max;
    elem.style.width = percentage + "%";
    elem.innerHTML = cur + "/" + max;
}

redraw();
