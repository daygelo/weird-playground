import Cell from './Cell';

enum CellType {
    Empty,
    Solid,
    Sand,
    KindaWetSand,
    WetSand,
    Water
}

enum Pos {
    TL,
    TC,
    TR,
    CR,
    BR,
    BC,
    BL,
    CL
}

type MaybeCell = Cell | null;

type CellNeighbours = [
    MaybeCell, MaybeCell, MaybeCell, MaybeCell, MaybeCell, MaybeCell, MaybeCell, MaybeCell
]

export { CellType, Pos, MaybeCell, CellNeighbours };