"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SudokuSolution = void 0;
const MUTABLE = 0;
const INITIAL_SCORE = 0;
const genOptions = [1, 2, 3, 4, 5, 6];
class SudokuSolution {
    constructor(_seedBoard, board) {
        this._seedBoard = _seedBoard;
        this._board = [];
        this._fitnessScore = 0;
        if (board) {
            this._board = [...board];
            this.evaluate();
        }
        else {
            this.initialize(_seedBoard);
        }
    }
    get board() {
        return this._board;
    }
    get fitnessScore() {
        return this._fitnessScore;
    }
    initialize(seedBoard) {
        // fill the empty places by random numbers
        for (let dnaSectorIndex = 0; dnaSectorIndex < seedBoard.length; dnaSectorIndex++) {
            const dna = [...seedBoard[dnaSectorIndex]];
            for (let genIndex = 0; genIndex < dna.length; genIndex++) {
                if (seedBoard[dnaSectorIndex][genIndex] === MUTABLE) {
                    dna[genIndex] = this.generateGen();
                }
            }
            this.board.push(dna);
        }
        this.evaluate();
    }
    evaluate() {
        // console.log('***********EVALUATE***************');
        let fitnessScore = INITIAL_SCORE;
        const blockEntriesIndexes = [
            { i: 0, j: 0 }, { i: 0, j: 3 },
            { i: 2, j: 0 }, { i: 2, j: 3 },
            { i: 4, j: 0 }, { i: 4, j: 3 },
        ];
        //check duplicate for rows
        this.board.forEach((dnaSector, index) => {
            genOptions.forEach((gene) => {
                if (dnaSector.indexOf(gene) !== -1) {
                    fitnessScore = fitnessScore + 1;
                }
            });
            // console.log(`dnaSector ${index} score = ${fitnessScore}`);
        });
        //check duplicate for columns
        for (let i = 0; i < this.board.length; i++) {
            genOptions.forEach(gene => {
                let found = false;
                for (let j = 0; j < this.board.length && !found; j++) {
                    found = gene === this.board[j][i];
                }
                if (found) {
                    fitnessScore = fitnessScore + 1;
                }
            });
        }
        //check duplicate duplicates for blocks
        blockEntriesIndexes.forEach(({ i, j }) => {
            genOptions.forEach(gene => {
                let found = false;
                for (let blockRow = i; blockRow < i + 2 && !found; blockRow++) {
                    for (let blockCol = j; blockCol < j + 3 && !found; blockCol++) {
                        found = this.board[blockRow][blockCol] === gene;
                    }
                }
                if (found) {
                    fitnessScore = fitnessScore + 1;
                }
                else {
                    fitnessScore = fitnessScore - 3;
                }
            });
        });
        this._fitnessScore = fitnessScore;
        return fitnessScore;
    }
    mutate() {
        let mutated = false;
        while (!mutated) {
            const row = Math.floor(Math.random() * 6);
            const col = Math.floor(Math.random() * 6);
            if (this._seedBoard[row][col] === MUTABLE) {
                const gene = this.generateGen();
                this.board[row][col] = gene;
                mutated = true;
            }
        }
        return this;
    }
    crossoverWith(o) {
        const newBoard = [];
        let child1 = [];
        let child2 = [];
        let i = 0;
        for (; i < this.board.length / 2; i++) {
            child1.push([...this._board[i]]);
            child2.push([...o._board[i]]);
        }
        for (; i < this.board.length; i++) {
            child2.push([...this._board[i]]);
            child1.push([...o._board[i]]);
        }
        return [new SudokuSolution([...this._seedBoard], child1), new SudokuSolution([...this._seedBoard], child2)];
    }
    generateGen() {
        return Math.floor((Math.random() * 6)) + 1;
    }
}
exports.SudokuSolution = SudokuSolution;
//# sourceMappingURL=sudoku-solution.model.js.map