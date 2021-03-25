import * as _ from 'lodash';
import { Random } from 'random-js';
const RESOLVED_SCORE = 108;
const optionNumbers = [1, 2, 3, 4, 5, 6];
const POP_COUNT = 210;
const MAX_POP = 213.2;
const MUTATION_RATE = 0.35;
const MUTATION_ACCELERATION_RATE = 0.0001;
const POPULATION_ACCELERATION_RATE = 0.01;


interface SolutionData {
  sol: number[][];
  fitness: number;
}
interface RouletteItemWheel {
  sol: SolutionData;
  posFrom: number;
  posTo: number;
}

type RouletteWheel = RouletteItemWheel[];

let sudoku =
  [
    [0, 5, 0, 0, 4, 0],
    [4, 0, 0, 5, 0, 2],
    [0, 6, 0, 0, 0, 0],
    [0, 0, 0, 0, 5, 0],
    [3, 0, 5, 0, 0, 4],
    [0, 2, 0, 0, 3, 0],
  ];
sudoku =
  [
    [0, 0, 6, 0, 3, 0],
    [3, 1, 4, 0, 2, 0],
    [0, 0, 5, 1, 4, 3],
    [1, 4, 3, 2, 0, 0],
    [0, 3, 0, 5, 6, 2],
    [0, 6, 0, 3, 0, 0],
  ];


function descendingSort(a: SolutionData, b: SolutionData) {
  return b.fitness - a.fitness;
}

function initialPop(sudoku: number[][], maxPopCount = 1) {

  const population: SolutionData[] = [];

  while (population.length < maxPopCount) {
    let sol = createSolFrom(sudoku);
    let fitness = getFitnessOf(sol);

    population.push({
      sol,
      fitness
    });
  }
  return population;

}

function getRowFitness(row: number[]) {
  let fitness = 0;
  optionNumbers.forEach((number) => {
    if (row.indexOf(number) !== -1) {
      fitness = fitness + 1;
    }
    else {
      fitness = fitness - 1;
    }
  });
  return fitness;
}

function getFitnessOf(sol: number[][]) {

  const numbers = [1, 2, 3, 4, 5, 6,];
  let fitness = 0;
  const blockEntriesIndexes = [
    { i: 0, j: 0 }, { i: 0, j: 3 },
    { i: 2, j: 0 }, { i: 2, j: 3 },
    { i: 4, j: 0 }, { i: 4, j: 3 },
  ];

  // duplicates in rows
  sol.forEach((row) => {
    fitness += getRowFitness(row);
  });

  //duplicate in columns 
  for (let i = 0; i < sol.length; i++) {
    numbers.forEach(number => {
      let found = false;
      for (let j = 0; j < sol.length && !found; j++) {
        found = number === sol[j][i];
      }
      if (found) {
        fitness = fitness + 1;
      }
      else {
        fitness = fitness - 2;
      }
    })
  }

  //duplicates in blocks
  blockEntriesIndexes.forEach(entry => {
    let found;
    numbers.forEach(num => {
      found = false;

      for (let i = entry.i; i < entry.i + 2 && !found; i++) {
        for (let j = entry.j; j < entry.j + 3 && !found; j++) {
          found = num === sol[i][j];
        }
      }
      if (found) {
        fitness = fitness + 1;
      } else {
        fitness = fitness - 3;
      }
    });
  });
  return fitness;
}

function createSolFrom(sudoku: number[][]) {
  const sol: number[][] = [];
  const random = new Random();
  for (let i = 0; i < sudoku.length; i++) {
    let row = [...sudoku[i]];
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 0) {
        row[j] = random.integer(1, 6);
      }
    }
    sol.push(row);
  }

  return sol;
}

function getBestSolution(population: SolutionData[]): SolutionData {
  let bestSol = population[0];
  population.forEach(sol => {
    if (sol.fitness > bestSol.fitness) {
      bestSol = sol;
    }
  })
  return bestSol;
}

function calculateFitnessSum(population: SolutionData[]): number {
  let sum = 0;
  population.forEach(sol => sum += sol.fitness);
  return sum;
}

function getRouletteWheel(population: SolutionData[], k: number) {
  return function rouletteWheel() {
    let tournamentGroup: SolutionData[] = [];
    // let targetNum = Math.random() * calculateFitnessSum(population);
    for (let i = 0; i < k; i++) {
      tournamentGroup.push(population[Math.floor(Math.random() * population.length)]);
    }
    tournamentGroup = tournamentGroup.sort(descendingSort);
    return tournamentGroup[0];

    // let i = 0;
    // // while (targetNum + population[i].fitness < fitnessSum) {
    // //   targetNum += population[i].fitness;
    // //   i++;
    // // }

    // do {
    //   targetNum -= population[i].fitness;
    //   i++;
    // } while (targetNum > 0 && i < population.length - 1);

    // return population[i - 1];

  }

  // return population.map(sol => {
  //   const posFrom = partialSum;
  //   const posTo = partialSum + (sol.fitness / fitnessSum);
  //   partialSum = posTo;
  //   return { sol, posFrom, posTo };
  // });
}

function selectParentsFrom(population: SolutionData[], selectionCount: number, k: number): SolutionData[] {
  const runRouletteWheel = getRouletteWheel(population, k);
  const parents: SolutionData[] = [];
  while (parents.length < selectionCount) {
    let selectedParent = runRouletteWheel();
    parents.push(selectedParent);
  }

  return parents;
}

function mergeRows(sol1: number[][], sol2: number[][]) {
  const child1: number[][] = [];
  const child2: number[][] = [];
  for (let index = 0; index < sol1.length; index++) {
    const f1 = getRowFitness(sol1[index]);
    const f2 = getRowFitness(sol2[index]);
    if (index < sol1.length / 2) {
      child1.push([...sol1[index]]);
      child2.push(([...sol2[index]]));
    } else {
      child1.push([...sol2[index]])
      child2.push([...sol1[index]])
    }
  }

  // }
  // let i = 0;
  // for (i = 0; i < sol1.length / 2; i++) {
  //   child1.push([...sol1[i]]);
  //   child2.push([...sol2[i]]);
  // }
  // for (; i < sol2.length; i++) {
  //   child1.push([...sol2[i]]);
  //   child2.push([...sol1[i]]);
  // }
  // const row = Math.floor(Math.random() * sol1.length);
  // const col = Math.floor(Math.random() * sol1.length);
  // let temp = sol1[row][col];
  // sol1[row][col] = sol2[row][col];
  // sol2[row][col] = temp;
  // temp = sol1[col][row];
  // sol1[col][row] = sol2[col][row];
  // sol2[col][row] = temp;
  // const row = Math.floor(Math.random() * sol1.length);
  // const temp = [...sol1[row]];
  // sol1[row] = [...sol2[row]];
  // sol2[row] = [...temp];

  return [child1, child2];
}

function crossover(parents: SolutionData[], pc: number, k: number): SolutionData[] {
  const rouletteWheel = getRouletteWheel(parents, k);
  const newBorns: SolutionData[] = [];
  for (let i = 0; i < parents.length; i++) {
    let poss = Math.random();
    if (poss > pc) {
      newBorns.push(parents[i]);

    } else {
      let f = parents[i];
      let s = rouletteWheel();
      let [sol1, sol2] = mergeRows(f.sol, s.sol);
      let fitness = getFitnessOf(sol1);
      newBorns.push({ sol: sol1, fitness });
      fitness = getFitnessOf(sol2);
      newBorns.push({ sol: sol2, fitness });
    }
  }

  return newBorns;
}


function mutate(population: SolutionData[], origin: number[][], pm: number): SolutionData[] {
  return population.map(sol => {
    let newSol = _.cloneDeep(sol);
    const random = new Random();

    let poss = Math.random();
    if (poss > pm) return newSol;
    let row = Math.floor(Math.random() * 6);

    for (let col = 0; col < 6; col++) {
      // let row = Math.floor(Math.random() * 6);
      if (origin[col][row] === 0) {
        newSol.sol[col][row] = random.integer(1, 6);
      }
    }



    return newSol;
  });
}

function print(bestSol: SolutionData, bestFromPop: SolutionData) {
  console.clear();
  console.table(bestSol.sol);
  console.log(bestSol.fitness);
  console.log('********from pop***********');

  console.table(bestFromPop.sol);
  console.log(bestFromPop.fitness);
  console.log(mr);
  console.log(popCount);
}

function getBestSolutions(population: SolutionData[], bestSol: SolutionData) {
  let bestFromPop = getBestSolution(population);
  bestSol = bestFromPop.fitness > bestSol.fitness ? bestFromPop : bestSol;
  return { bestFromPop, bestSol };
}


// const sudokuTest =
//   [
//     [1, 1, 1, 1, 1, 1, 6, 4, 1],
//     [1,6, 4, 1, 7, 1, 1, 8, 2],
//     [1, 1, 1, 2, 3, 1, 1, 1, 1],
//     [1, 1, 1, 1, 1, 8, 1, 1, 1],
//     [1, 1, 7, 4,6, 1, 1, 1, 5],
//     [1, 5, 1, 1, 1, 1, 3, 2, 1],
//     [1, 1, 1, 1, 1, 1, 1, 1, 1],
//     [6, 2, 8, 1, 1, 1, 1, 1,6],
//     [1, 3, 1, 6, 1, 5, 1, 7, 1]
//   ];
// function testFitness(sol: number[][], score: number): boolean {
//   const val = getFitnessOf(sol);
//   console.log(val);

//   return val === score;
// }

// console.log(testFitness(sudokuTest, 102));

console.time();
let resolved = false;
let popCount = POP_COUNT;
let mr = MUTATION_RATE;
let selectedParents: SolutionData[] = [];
let bestFromPop;
while (!resolved) {
  let population: SolutionData[] = initialPop(sudoku, popCount).sort(descendingSort);
  let bestSol = getBestSolution(population);
  popCount = POP_COUNT;
  while (popCount < MAX_POP && !resolved) {
    popCount += POPULATION_ACCELERATION_RATE;
    population = population.sort(descendingSort);
    ({ bestFromPop, bestSol, } = getBestSolutions(population, bestSol));
    resolved = bestSol.fitness === RESOLVED_SCORE;
    selectedParents = selectParentsFrom(population, popCount * 0.8, 12);
    population = crossover([bestSol, bestFromPop, ...selectedParents], 0.8, 12);
    mr += MUTATION_ACCELERATION_RATE;
    population = mutate([...population, ...initialPop(sudoku, popCount / 9)], sudoku, mr);
    print(bestSol, bestFromPop);
  }
}
console.timeEnd();


