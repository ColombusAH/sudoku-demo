"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SudokuSolver = void 0;
const sudoku_solution_model_1 = require("./sudoku-solution.model");
const INITIAL_SCORE = 0;
class SudokuSolver {
    constructor(seedBoard, maxPop = 200, maxGeneration = 500, mutateRate = 0.1, crossoverRate = 0.3) {
        this.seedBoard = seedBoard;
        this.maxPop = maxPop;
        this.maxGeneration = maxGeneration;
        this.mutateRate = mutateRate;
        this.crossoverRate = crossoverRate;
        this._population = [];
        this._population = this.getInitialPopulation(this.seedBoard, maxPop);
    }
    get population() {
        return this._population;
    }
    resolve() {
        let generation = 0;
        let population = this.population;
        console.log('*************RESOLVE*************');
        let bestSol = this.getBestSolution(population);
        do {
            console.clear();
            bestSol = this.getBestSolution(population);
            console.log('******************BEST SOLUTION*************************');
            console.table(bestSol.board);
            console.log(bestSol.fitnessScore);
            console.log('generation:', generation);
            population = this.selectNextGeneration(population);
            population = this.crossover(population);
            population = this.mutate(population);
        } while (generation++ < this.maxGeneration || bestSol.fitnessScore !== INITIAL_SCORE);
        console.log(population.length);
        console.log('*************END*************');
    }
    mutate(population) {
        return population.map(sol => {
            const pos = Math.random();
            if (pos <= this.mutateRate) {
                return sol.mutate();
            }
            return sol;
        });
    }
    crossover(population) {
        const fitnessSum = population.map(s => s.fitnessScore).reduce((acc, f) => acc + f, 0);
        let acc = 0;
        const pop = [];
        population = population.sort((a, b) => a.fitnessScore - b.fitnessScore);
        const selectionWheel = population.map((sol) => {
            acc += (sol.fitnessScore / fitnessSum);
            return acc;
        });
        let index = 0;
        while (pop.length < this.maxPop) {
            const pos = Math.random();
            let last = 0;
            const sol1 = index;
            const sol2 = selectionWheel.findIndex((p) => {
                const found = pos > last && pos < p;
                last = p;
                return found;
            });
            const sol = Math.random() <= this.crossoverRate ? population[sol1].crossoverWith(population[sol2]) : [population[sol1], population[sol2]];
            pop.push(...sol);
            index++;
        }
        return pop;
    }
    selectNextGeneration(population) {
        const fitnessSum = population.map(s => s.fitnessScore).reduce((acc, f) => acc + f, 0);
        let acc = 0;
        const selectedPop = [];
        population = population.sort((a, b) => a.fitnessScore - b.fitnessScore);
        const selectionWheel = population.map(sol => {
            acc += (sol.fitnessScore / fitnessSum);
            return acc;
        });
        // console.log('*************SELECTION WHEEL*******************');
        // console.table(selectionWheel);
        // console.log('********************FITNESS_SUM**************************');
        // console.log(fitnessSum);
        // console.log(population.length);
        let index = 0;
        while (index < this.maxPop / 2) {
            selectedPop.push(population[index]);
            index++;
        }
        while (selectedPop.length < this.maxPop) {
            const pos = Math.random();
            let last = 0;
            const selectedIndex = selectionWheel.findIndex((p) => {
                const found = pos > last && pos < p;
                last = p;
                return found;
            });
            selectedPop.push(population[selectedIndex]);
        }
        // console.log('******************SELECTED*******************');
        // console.table(selectedPop, ['_fitnessScore']);
        return selectedPop;
    }
    getInitialPopulation(seedBoard, maxPop) {
        let popCount = 0;
        const pop = [];
        while (popCount < maxPop) {
            pop.push(new sudoku_solution_model_1.SudokuSolution([...seedBoard]));
            popCount++;
        }
        return pop;
    }
    getBestSolution(population) {
        let maxFitness = 0;
        let fittestIndex = 0;
        population.forEach((sol, index) => {
            if (sol.fitnessScore > maxFitness) {
                maxFitness = sol.fitnessScore;
                fittestIndex = index;
            }
        });
        return population[fittestIndex];
    }
}
exports.SudokuSolver = SudokuSolver;
//# sourceMappingURL=sudoku-solver.model.js.map