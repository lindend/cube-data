
export type Color = 'white' | 'yellow' | 'red' | 'orange' | 'green' | 'blue';

export class Side {
    constructor (
        public pieces: Color[],
        public rotations: number[] = [0, 1, 2, 3]
    ) {}

    get center(): Color {
        return this.pieces[4];
    }
}

export enum Axis {
    x = 0,
    y = 1,
    z = 2
}

export enum SideId {
    x_front,
    x_back,
    y_front,
    y_back,
    z_front,
    z_back
}

class SideDefinition {

}

export class Position {
    constructor (
        public x: number,
        public y: number,
        public z: number
    ){}
}

export class Piece {
    constructor (
        public position: number[],
        public colors: Color[]
    ) {}

    swapColors(color0: number, color1: number) {
        let firstColor = this.colors[color0];
        this.colors[color0] = this.colors[color1];
        this.colors[color1] = firstColor;
    }

    rotate(row: number, column: number) {
        //Rotation of (x, y) is  (y, -x) around origo (0,0)
        let rotatedCol = this.position[row];
        let rotatedRow = -this.position[column];

        this.position[row] = rotatedRow;
        this.position[column] = rotatedCol;
    }

    isEdge(row: number, column: number) {
        return (this.position[row] + this.position[column]) % 2 === 1;
    }

    isCenter(row: number, column: number) {
        return this.position[row] === 0 && this.position[column] === 0;
    }

    isCorner(row: number, column: number) {
        return this.position[row] % 2 === 1 && this.position[column] % 2 === 1;
    }
}

class SidePair {
    constructor (
        public side0: Side,
        public side0RotationOffset: number,
        public side1: Side,
        public side1RotationOffset: number
    ) {}
}

function getSide(sides: Side[], color: Color): Side {
    return sides.find(s => s.center === color);
}

function makeSidePair(sides: Side[], color0: Color, rotation0: number, color1: Color, rotation1: number): SidePair {
    return new SidePair(getSide(sides, color0), rotation0, getSide(sides, color1), rotation1);
}

function getSidePairs(sides: Side[]): SidePair[] {
    return [
        makeSidePair(sides, 'white', 1, 'red', 3),
        makeSidePair(sides, 'white', 2, 'green', 0),
        makeSidePair(sides, 'white', 0, 'blue', 2),
        makeSidePair(sides, 'white', 3, 'orange', 1),

        makeSidePair(sides, 'yellow', 3, 'red', 1),
        makeSidePair(sides, 'yellow', 2, 'green', 2),
        makeSidePair(sides, 'yellow', 0, 'blue', 0),
        makeSidePair(sides, 'yellow', 1, 'orange', 3),

        makeSidePair(sides, 'blue', 1, 'red', 0),
        makeSidePair(sides, 'blue', 3, 'orange', 0),
        makeSidePair(sides, 'green', 1, 'red', 2),
        makeSidePair(sides, 'green', 3, 'orange', 2),
    ];
}

function areOppositeColors(color0: Color, color1: Color): boolean {
    return (color0 === 'white' && color1 === 'yellow') ||
           (color0 === 'yellow' && color1 === 'white') ||
           (color0 === 'red' && color1 === 'orange') ||
           (color0 === 'orange' && color1 === 'red') ||
           (color0 === 'green' && color1 === 'blue') ||
           (color0 === 'blue' && color1 === 'green');
}

function canBeOnSamePiece(color0: Color, color1: Color): boolean {
    return color0 !== color1 &&
        !areOppositeColors(color0, color1);
}

function getEdgeAtRotation(side: Side, sideRotation: number, rotationOffset: number): Color[] {
    let rotation = (sideRotation + rotationOffset) % 4;
    switch (rotation) {
        case 0:
            return [side.pieces[0], side.pieces[1], side.pieces[2]];
        case 1:
            return [side.pieces[2], side.pieces[5], side.pieces[8]];
        case 2:
            return [side.pieces[8], side.pieces[7], side.pieces[6]];
        case 3:
            return [side.pieces[6], side.pieces[3], side.pieces[0]];
    }
}

function edgesMatch(edge0: Color[], edge1: Color[]): boolean {
    for (let i = 0; i < 3; ++i) {
        if (!canBeOnSamePiece(edge0[i], edge1[2 - i])) {
            return false;
        }
    }
    return true;
}

function hasMatchingEdge(edge: Color[], side1: Side, side1Rotations: number[], side1RotationOffset): boolean {
    for (let rotation of side1Rotations) {
        let edge1 = getEdgeAtRotation(side1, rotation, side1RotationOffset);
        if (edgesMatch(edge, edge1)) {
            return true;
        }
    }
    return false;
}

function removeSideRotations(side0: Side, side0RotationOffset: number, side1: Side, side1RotationOffset) {
    let removed = false;
    let i = side0.rotations.length;
    while (i--) {
        let rotation = side0.rotations[i];
        let edge = getEdgeAtRotation(side0, rotation, side0RotationOffset);
        if (!hasMatchingEdge(edge, side1, side1.rotations, side1RotationOffset)) {
            side0.rotations.splice(i, 1);
            removed = true;
        }
    }

    return removed;
}

function removePairRotations(pair: SidePair): boolean {
    let removed = removeSideRotations(pair.side0, pair.side0RotationOffset, pair.side1, pair.side1RotationOffset) ||
                  removeSideRotations(pair.side1, pair.side1RotationOffset, pair.side0, pair.side0RotationOffset);
    return removed;
}

function getSidePair(sidePairs: SidePair[], color0: Color, color1: Color): SidePair {
    return sidePairs.find(sp => (sp.side0.center === color0 && sp.side1.center === color1) || 
                                (sp.side0.center === color1 && sp.side1.center === color0));
}

function getCornerPiece(sidePairs: SidePair[], position: number[], color0: Color, color1: Color, color2: Color): Piece {
    return new Piece([], []);
} 

function getEdgePiece(sidePairs: SidePair[], color0: Color, color1: Color): Color[] {
    let sidePair = getSidePair(sidePairs, color0, color1);
    let edge0 = getEdgeAtRotation(sidePair.side0, sidePair.side0.rotations[0], sidePair.side0RotationOffset);
    let edge1 = getEdgeAtRotation(sidePair.side1, sidePair.side1.rotations[1], sidePair.side1RotationOffset);

    if (sidePair.side0.center === color0) {
        return [edge0[1], edge1[1]];
    } else {
        return [edge1[1], edge0[1]];
    }
}

function createPiecesFromSidePairs(sidePairs: SidePair[]): Piece[] {
    return [
            new Piece([0, 0, 0], ['white', 'blue', 'orange']),
            new Piece([0, 0, 1], ['white', 'blue', null]),
            new Piece([0, 0, 2], ['white', 'blue', 'red']),

            new Piece([0, 1, 0], ['white', null, 'orange']),
            new Piece([0, 1, 1], ['white', null, null]),
            new Piece([0, 1, 2], ['white', null, 'red']),

            new Piece([0, 2, 0], ['white', 'green', 'orange']),
            new Piece([0, 2, 1], ['white', 'green', null]),
            new Piece([0, 2, 2], ['white', 'green', 'red']),


            new Piece([1, 0, 0], [null, 'blue', 'orange']),
            new Piece([1, 0, 1], [null, 'blue', null]),
            new Piece([1, 0, 2], [null, 'blue', 'red']),

            new Piece([1, 1, 0], [null, null, 'orange']),
            new Piece([1, 1, 2], [null, null, 'red']),

            new Piece([1, 2, 0], [null, 'green', 'orange']),
            new Piece([1, 2, 1], [null, 'green', null]),
            new Piece([1, 2, 2], [null, 'green', 'red']),


            new Piece([2, 0, 0], ['yellow', 'blue', 'orange']),
            new Piece([2, 0, 1], ['yellow', 'blue', null]),
            new Piece([2, 0, 2], ['yellow', 'blue', 'red']),

            new Piece([2, 1, 0], ['yellow', null, 'orange']),
            new Piece([2, 1, 1], ['yellow', null, null]),
            new Piece([2, 1, 2], ['yellow', null, 'red']),

            new Piece([2, 2, 0], ['yellow', 'green', 'orange']),
            new Piece([2, 2, 1], ['yellow', 'green', null]),
            new Piece([2, 2, 2], ['yellow', 'green', 'red']),
        ];
}

function cross(v0: number[], v1: number[]): number[] {
    return [
        v0[1] * v1[2] - v0[2] * v1[1],
        v0[2] * v1[0] - v0[0] * v1[2],
        v0[0] * v1[1] - v0[1] * v1[0]
    ]   
}

function dot(v0: number[], v1: number[]): number {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
}

function mul(v: number[], num: number): number[] {
    return [
        v[0] * num,
        v[1] * num,
        v[2] * num
    ];
}

function add(v0: number[], v1: number[]): number[] {
    return [
        v0[0] + v1[0],
        v0[1] + v1[1],
        v0[2] + v1[2]
    ]
}

export class Cube {
    constructor (
        public pieces: Piece[]
    ) {
    }

    public static create(): Cube {
        return new Cube([
            new Piece([-1, -1, -1], ['white', 'blue', 'orange']),
            new Piece([-1, -1, 0], ['white', 'blue', null]),
            new Piece([-1, -1, 1], ['white', 'blue', 'red']),

            new Piece([-1, 0, -1], ['white', null, 'orange']),
            new Piece([-1, 0, 0], ['white', null, null]),
            new Piece([-1, 0, 1], ['white', null, 'red']),

            new Piece([-1, 1, -1], ['white', 'green', 'orange']),
            new Piece([-1, 1, 0], ['white', 'green', null]),
            new Piece([-1, 1, 1], ['white', 'green', 'red']),


            new Piece([0, -1, -1], [null, 'blue', 'orange']),
            new Piece([0, -1, 0], [null, 'blue', null]),
            new Piece([0, -1, 1], [null, 'blue', 'red']),

            new Piece([0, 0, -1], [null, null, 'orange']),
            new Piece([0, 0, 1], [null, null, 'red']),

            new Piece([0, 1, -1], [null, 'green', 'orange']),
            new Piece([0, 1, 0], [null, 'green', null]),
            new Piece([0, 1, 1], [null, 'green', 'red']),


            new Piece([1, -1, -1], ['yellow', 'blue', 'orange']),
            new Piece([1, -1, 0], ['yellow', 'blue', null]),
            new Piece([1, -1, 1], ['yellow', 'blue', 'red']),

            new Piece([1, 0, -1], ['yellow', null, 'orange']),
            new Piece([1, 0, 0], ['yellow', null, null]),
            new Piece([1, 0, 1], ['yellow', null, 'red']),

            new Piece([1, 1, -1], ['yellow', 'green', 'orange']),
            new Piece([1, 1, 0], ['yellow', 'green', null]),
            new Piece([1, 1, 1], ['yellow', 'green', 'red']),
        ]);
    }

    public static analyze(sides: Side[]): Cube {
        let sidePairs = getSidePairs(sides);
        
        let removedRotation = false;

        do {
            removedRotation = false;
            for (let pair of sidePairs) {
                removedRotation = removedRotation || removePairRotations(pair);
            }
        } while (removedRotation)

        return new Cube(createPiecesFromSidePairs(sidePairs));
    }

    public rotateAxis(axis: Axis, layer: number) {
        let layerPieces = this.getPiecesInLayer(axis, layer);

        let row = this.getRowIndex(axis);
        let column = this.getColumnIndex(axis);

        for (var i = 0; i < layerPieces.length; ++i) {
            let piece = layerPieces[i];

            if (piece.isCenter(row, column)) {
                continue;
            }

            piece.swapColors(row, column);
            piece.rotate(row, column);
        }
    }

    public getPiecesInLayer(axis: Axis, layer: number) {
        return this.pieces.filter(p => p.position[axis] === layer);
    }

    private transformPosition(position: number[], flipAxis: Axis, layer: number) {
        if (layer === 2) {
            let newPos = position.slice(0);
            newPos[flipAxis] =  -position[flipAxis];
            return position;
        }
        return position;
    }

    private getFlipAxis(axis: Axis) {
        switch (axis) {
            case Axis.x:
                return Axis.z;
            case Axis.y:
                return Axis.x;
            case Axis.z:
                return Axis.y;
        }
    }

    public getSide(axis: Axis, layer: number, up: Axis): Color[] {
        let v_up = [0, 0, 0];
        v_up[up] = 1;

        let v_forward = [0, 0, 0];
        v_forward[axis] = -layer;

        let v_right = cross(v_forward, v_up);
        let pieces = this.getPiecesInLayer(axis, layer);

        let indexScale = add(mul(v_up, 3), v_right);
        
        let sortedPieces = pieces.sort((p0, p1) => {
            let index0 = dot(p0.position, indexScale);
            let index1 = dot(p1.position, indexScale);
            return index0 - index1;
        });
        return sortedPieces.map(p => p.colors[axis]);
    }

    public getColumnIndex(axis: Axis): number {
        return axis === 0 ? 2 : axis - 1;
    }

    public getRowIndex(axis: Axis) : number {
        return (axis + 1) % 3;
    }
}

