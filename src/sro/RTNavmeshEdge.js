export class RTNavmeshEdge {
    constructor(index, mesh, p1, p2, flag, sourceDirection = 0, destinationDirection = 0, sourceCellIndex = 0, destinationCellIndex = 0) {
        this.index = index;
        this.mesh = mesh;
        this.p1 = p1;
        this.p2 = p2;
        this.flag = flag;
        this.sourceDirection = sourceDirection;
        this.destinationDirection = destinationDirection;
        this.sourceCellIndex = sourceCellIndex;
        this.destinationCellIndex = destinationCellIndex;
    }

    isBlocked(cell) {
        if (this.sourceCellIndex === cell.index) {
            return (this.flag & 1) != 0
        } else {
            return (this.flag & 2 ) != 0
        }
    }
}

export class RTNavmeshEdgeGlobal extends RTNavmeshEdge {
    constructor(index, mesh, p1, p2, flag, sourceDirection = 0, destinationDirection = 0, sourceCellIndex, destinationCellIndex, sourceMeshIndex, destinationMeshIndex) {
        super(index, mesh, p1, p2, flag, sourceDirection, destinationDirection, sourceCellIndex, destinationCellIndex)
        this.sourceMeshIndex = sourceMeshIndex;
        this.destinationMeshIndex = destinationMeshIndex;
    }
}

export class RTNavmeshEdgeInternal extends RTNavmeshEdge {
    constructor(index, mesh, p1, p2, flag, sourceDirection = 0, destinationDirection = 0, sourceCellIndex, destinationCellIndex) {
        super(index, mesh, p1, p2, flag, sourceDirection, destinationDirection, sourceCellIndex, destinationCellIndex)
    }
}