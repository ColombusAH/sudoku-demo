import { SudokuSolution } from './sudoku-solution.model';
const INITIAL_SCORE = 0;
export class SudokuSolver {

  private _population: SudokuSolution[] = [];

  public get population(): SudokuSolution[] {
    return this._population;
  }

  constructor(
    private seedBoard: number[][],
    private maxPop = 200,
    private maxGeneration = 500,
    private mutateRate = 0.1,
    private crossoverRate = 0.3,
  ) {
    this._population = this.getInitialPopulation(this.seedBoard, maxPop);
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

  private mutate(population: SudokuSolution[]) {
    return population.map(sol => {
      const pos = Math.random();
      if (pos <= this.mutateRate) {
        return sol.mutate();
      }
      return sol;
    });


  }

  private crossover(population: SudokuSolution[]) {
    const fitnessSum = population.map(s => s.fitnessScore).reduce((acc, f) => acc + f, 0);
    let acc = 0
    const pop: SudokuSolution[] = [];
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
        const found = pos > last && pos < p
        last = p;
        return found;
      });
      const sol = Math.random() <= this.crossoverRate ? population[sol1].crossoverWith(population[sol2]) : [population[sol1], population[sol2]];
      pop.push(...sol);
      index++;

    }
    return pop;
  }

  private selectNextGeneration(population: SudokuSolution[]) {
    const fitnessSum = population.map(s => s.fitnessScore).reduce((acc, f) => acc + f, 0);
    let acc = 0
    const selectedPop: SudokuSolution[] = [];
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
        const found = pos > last && pos < p
        last = p;
        return found;
      });
      selectedPop.push(population[selectedIndex]);
    }

    // console.log('******************SELECTED*******************');
    // console.table(selectedPop, ['_fitnessScore']);
    return selectedPop;
  }

  private getInitialPopulation(seedBoard: number[][], maxPop: number) {
    let popCount = 0;
    const pop: SudokuSolution[] = [];

    while (popCount < maxPop) {
      pop.push(new SudokuSolution([...seedBoard]));
      popCount++;
    }
    return pop;
  }

  private getBestSolution(population: SudokuSolution[]) {
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