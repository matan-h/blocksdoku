# BlocksDoku

BlocksDoku is a mini-game inspired by [Blockudoku](https://play.google.com/store/apps/details?id=com.easybrain.block.puzzle.games), a popular block puzzle game that combines sudoku and Tetris elements. BlocksDoku is written in TypeScript and runs in the browser.

![screenshots/game.png]

## How to play
The goal of BlocksDoku is to fill the 9x9 grid with blocks of different shapes and colors. You can drag and drop the blocks from the bottom panel to the grid. When you complete a full row, column, or 3x3 square, it will disappear and you will score points. The game ends when there is no more space for new blocks.

There is a [online version here](http://localhost:5173/)

## How to install
To install BlocksDoku locally, you need to have [Node.js](https://nodejs.org) installed. Then, follow these steps:

1. Clone this repository to your local machine: `git clone https://github.com/matan-h/blocksdoku.git`
2. Navigate to the project folder: `cd blocksdoku`
3. Install the dependencies: `pnpm install`
4. Run the project: `pnpm dev`
6. Open the localhost url your browser.

## License

BlocksDoku is licensed under the [MIT License](https://opensource.org/license/MIT/), which means you can use, modify, and distribute it freely, as long as you give credit to the original author and include a copy of the license in your project.
