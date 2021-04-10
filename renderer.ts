import { shell } from 'electron';
import Cell from './scripts/Cell';
import { CellNeighbours, CellType } from './scripts/types';

/*  Github Link  */

const githubLink = document.querySelector('#github-link');
githubLink.addEventListener('click', () => shell.openExternal('https://github.com/angelodjeumene'));

const repoLink = document.querySelector('#repo-link');
repoLink.addEventListener('click', () => shell.openExternal('https://github.com/angelodjeumene/weird-playground'));

/*  Config  */

const cellUnit = 4;
const playgroundWidth = 225; // 225 * 4 = 900
const playgroundHeight = 100; // 100 * 4 = 400

const pixelToCell = (val: number) => Math.floor(val / cellUnit);
const materialElements = document.querySelector('#materials').querySelectorAll('.choice');
const sizeElements = document.querySelector('#sizes').querySelectorAll('.choice');
let selectedMaterial: CellType = CellType.Solid;
let selectedSize: number = 2;

/*  Create Canvas  */

const canvas: HTMLCanvasElement = document.querySelector('canvas');
canvas.width = cellUnit * playgroundWidth;
canvas.height = cellUnit * playgroundHeight;
canvas.addEventListener('contextmenu', e => e.preventDefault());

const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

/*  Setup Cells  */

const cells: Cell[] = [];

for (let row = 0; row < playgroundHeight; row++) {
    for (let col = 0; col < playgroundWidth; col++) {
        const cellNeighbors: CellNeighbours = [ null, null, null, null, null, null, null, null ];
        const cell = new Cell(ctx, cellUnit, col, row, cellNeighbors, cells);
        cells.push(cell);
    }
}

for (const cell of cells)
    cell.setNeighbours();

/*  Events  */

let isDrawing: boolean = false;
let drawingX: number = 2;
let drawingY: number = 2;

canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mousedown', event => {
    const cellX = pixelToCell(drawingX);
    const cellY = pixelToCell(drawingY);
    const cellIndex = cellX + cellY * playgroundWidth;
    if (event.shiftKey)
        console.log(cells[cellIndex]);
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousemove', event => {
    if (
        event.offsetX >= 0 && event.offsetX <= canvas.width &&
        event.offsetY >= 0 && event.offsetY <= canvas.height
    ) {
        drawingX = event.offsetX;
        drawingY = event.offsetY;
    }
})

for (let i = 0; i < materialElements.length; i++) {
    materialElements[i].addEventListener('click', () => {
        if (i !== selectedMaterial) {
            materialElements.forEach(elm => elm.className = 'choice');
            materialElements[i].className = 'choice active';
            selectedMaterial = +materialElements[i].id[1];
        }
    })
}

for (let i = 0; i < sizeElements.length; i++) {
    sizeElements[i].addEventListener('click', () => {
        if (i !== selectedSize) {
            sizeElements.forEach(elm => elm.className = 'choice');
            sizeElements[i].className = 'choice active';
            selectedSize = +sizeElements[i].id[1];
        }
    })
}

/*  Main Functions  */

const update = () => {
    cells.forEach(cell => cell.update());

    if (isDrawing) {
        const cellX = pixelToCell(drawingX);
        const cellY = pixelToCell(drawingY);
        const cellIndex = cellX + cellY * playgroundWidth;
        const selectedCells: Cell[] = [];

        if (selectedMaterial !== CellType.Empty) {
            if (cells[cellIndex].type === CellType.Empty)
                selectedCells.push(cells[cellIndex]);

            if (selectedSize > 1) {
                cells[cellIndex].neighbours.forEach(cell1 => {
                    if (cell1 && cell1.type === CellType.Empty) {
                        selectedCells.push(cell1);
                        if (selectedSize > 2) {
                            cell1.neighbours.forEach(cell2 => {
                                if (cell2 && cell2.type === CellType.Empty) {
                                    selectedCells.push(cell2);
                                    if (selectedSize > 3) {
                                        cell2.neighbours.forEach(cell3 => {
                                            if (cell3 && cell3.type === CellType.Empty) {
                                                selectedCells.push(cell3);
                                                if (selectedSize > 4) {
                                                    cell3.neighbours.forEach(cell4 => {
                                                        if (cell4 && cell4.type === CellType.Empty)
                                                            selectedCells.push(cell4);
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        } else {
            if (cells[cellIndex].type !== CellType.Empty)
                selectedCells.push(cells[cellIndex]);

            if (selectedSize > 1) {
                cells[cellIndex].neighbours.forEach(cell1 => {
                    if (cell1 && cell1.type !== CellType.Empty) {
                        selectedCells.push(cell1);
                        if (selectedSize > 2) {
                            cell1.neighbours.forEach(cell2 => {
                                if (cell2 && cell2.type !== CellType.Empty) {
                                    selectedCells.push(cell2);
                                    if (selectedSize > 3) {
                                        cell2.neighbours.forEach(cell3 => {
                                            if (cell3 && cell3.type !== CellType.Empty) {
                                                selectedCells.push(cell3);
                                                if (selectedSize > 4) {
                                                    cell3.neighbours.forEach(cell4 => {
                                                        if (cell4 && cell4.type !== CellType.Empty)
                                                            selectedCells.push(cell4);
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }

        selectedCells.forEach(cell => cell.type = selectedMaterial);
    }
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cells.forEach(cell => cell.draw());
}

const tick = () => {
    update();
    draw();
    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);