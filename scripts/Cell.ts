import Color from 'color';
import { CellNeighbours, CellType, MaybeCell, Pos } from './types';

const colours = {
    solid: Color('#263940'),
    sand1: Color('#dcab86'),
    sand2: Color('#d4875b'),
    sand3: Color('#a16348'),
    sand4: Color('#874a37'),
    water1: Color('#2288fc'),
    water2: Color('#1a5ce0'),
}

class Cell {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly cellUnit: number;
    private _type: CellType = CellType.Empty;
    public updated: boolean = false;
    private colour: string = '';
    
    set type(type: CellType) {
        this._type = type;
        this.updated = true;

        switch (this._type) {
            default:
            case CellType.Empty:
                this.colour = '';
                break;
            case CellType.Solid:
                this.colour = colours.solid.hex();
                break;
            case CellType.Sand:
                this.colour = colours.sand1.mix(colours.sand2, Math.random()).hex();
                break;
            case CellType.KindaWetSand:
                this.colour = colours.sand2.mix(colours.sand3, Math.random()).hex();
                break;
            case CellType.WetSand:
                this.colour = colours.sand3.mix(colours.sand4, Math.random()).hex();
                break;
            case CellType.Water:
                this.colour = colours.water1.mix(colours.water2, Math.random()).hex();
                break;
        }
    }
    
    get type() {
        return this._type;
    }

    constructor(
        ctx: CanvasRenderingContext2D,
        cellUnit: number,
        public x: number,
        public y: number,
        public neighbours: CellNeighbours,
        private cells: Cell[]
    ) {
        this.ctx = ctx;
        this.cellUnit = cellUnit;
        this.x = x;
        this.y = y;
        this.neighbours = neighbours;
        this.cells = cells;
    }

    isOnLeft = (cell: Cell) => cell.x === this.x - 1;
    isOnRight = (cell: Cell) => cell.x === this.x + 1;
    isOnCenterX = (cell: Cell) => cell.x === this.x;
    isOnTop = (cell: Cell) => cell.y === this.y - 1;
    isOnBottom = (cell: Cell) => cell.y === this.y + 1;
    isOnCenterY = (cell: Cell) => cell.y === this.y;

    setNeighbours() {
        for (let i = 0; i < this.neighbours.length; i++) {
            let neighbour: MaybeCell;
            switch (i) {
                case Pos.TL:
                    neighbour = this.cells.find(c => this.isOnTop(c) && this.isOnLeft(c));
                    break;
                case Pos.TC:
                    neighbour = this.cells.find(c => this.isOnTop(c) && this.isOnCenterX(c));
                    break;
                case Pos.TR:
                    neighbour = this.cells.find(c => this.isOnTop(c) && this.isOnRight(c));
                    break;
                case Pos.CR:
                    neighbour = this.cells.find(c => this.isOnCenterY(c) && this.isOnRight(c));
                    break;
                case Pos.BR:
                    neighbour = this.cells.find(c => this.isOnBottom(c) && this.isOnRight(c));
                    break;
                case Pos.BC:
                    neighbour = this.cells.find(c => this.isOnBottom(c) && this.isOnCenterX(c));
                    break;
                case Pos.BL:
                    neighbour = this.cells.find(c => this.isOnBottom(c) && this.isOnLeft(c));
                    break;
                case Pos.CL:
                    neighbour = this.cells.find(c => this.isOnCenterY(c) && this.isOnLeft(c));
                    break;
            }

            this.neighbours[i] = neighbour || null;
        }
    }

    update() {
        /*  Cell Updates  */

        if (!this.updated) {
            switch (this.type) {
                default:
                case CellType.Empty:
                case CellType.Solid:
                    break;
                case CellType.Sand:
                    if (this.neighbours[Pos.BC] && this.neighbours[Pos.BC].type === CellType.Empty) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.BC].type = CellType.Sand;
                    } else if (
                        (this.neighbours[Pos.BL] && this.neighbours[Pos.BL].type === CellType.Empty) &&
                        !(this.neighbours[Pos.BR] && this.neighbours[Pos.BR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.BL].type = CellType.Sand;
                    } else if (
                        !(this.neighbours[Pos.BL] && this.neighbours[Pos.BL].type === CellType.Empty) &&
                        (this.neighbours[Pos.BR] && this.neighbours[Pos.BR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.CR].type = CellType.Sand;
                    } else if (
                        (this.neighbours[Pos.BL] && this.neighbours[Pos.BL].type === CellType.Empty) &&
                        (this.neighbours[Pos.BR] && this.neighbours[Pos.BR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Math.random() > 0.5 ? Pos.BR : Pos.BL].type = CellType.Sand;
                    } else {
                        for (let neighbour of this.neighbours) {
                            if (neighbour && neighbour.type === CellType.Water) {
                                this.type = CellType.WetSand;
                                neighbour.type = CellType.WetSand;
                                break;
                            } else if (neighbour && neighbour.type === CellType.WetSand)
                                this.type = CellType.KindaWetSand;
                        }
                    }
                    break;
                case CellType.KindaWetSand:
                    if (this.neighbours[Pos.BC] && this.neighbours[Pos.BC].type === CellType.Empty) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.BC].type = CellType.KindaWetSand;
                    } else {
                        for (let neighbour of this.neighbours) {
                            if (neighbour && neighbour.type === CellType.Water) {
                                this.type = CellType.WetSand;
                                neighbour.type = CellType.WetSand;
                            }
                        }
                    }
                    break;
                case CellType.WetSand:
                    if (this.neighbours[Pos.BC] && this.neighbours[Pos.BC].type === CellType.Empty) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.BC].type = CellType.WetSand;
                    } else if (this.neighbours[Pos.BC] && this.neighbours[Pos.BC].type === CellType.Water) {
                        this.type = CellType.Water;
                        this.neighbours[Pos.BC].type = CellType.WetSand;
                    }
                    break;
                case CellType.Water:
                    if (this.neighbours[Pos.BC] && this.neighbours[Pos.BC].type === CellType.Empty) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.BC].type = CellType.Water;
                    } else if (
                        (this.neighbours[Pos.CL] && this.neighbours[Pos.CL].type === CellType.Empty) &&
                        !(this.neighbours[Pos.CR] && this.neighbours[Pos.CR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.CL].type = CellType.Water;
                    } else if (
                        !(this.neighbours[Pos.CL] && this.neighbours[Pos.CL].type === CellType.Empty) &&
                        (this.neighbours[Pos.CR] && this.neighbours[Pos.CR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Pos.CR].type = CellType.Water;
                    } else if (
                        (this.neighbours[Pos.CL] && this.neighbours[Pos.CL].type === CellType.Empty) &&
                        (this.neighbours[Pos.CR] && this.neighbours[Pos.CR].type === CellType.Empty)
                    ) {
                        this.type = CellType.Empty;
                        this.neighbours[Math.random() > 0.5 ? Pos.CR : Pos.CL].type = CellType.Water;
                    }
                    break;
            }
        }

        this.updated = false;
    }

    draw() {
        this.ctx.fillStyle = this.colour;

        if (this.type !== CellType.Empty)
            this.ctx.fillRect(
                this.x * this.cellUnit,
                this.y * this.cellUnit,
                this.cellUnit,
                this.cellUnit,
            )
    }
}

export default Cell;