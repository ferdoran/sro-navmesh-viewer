import { BufferGeometry, Line, LineBasicMaterial, DoubleSide, BoxGeometry, Mesh, MeshBasicMaterial, BoxHelper } from "three"
import { RTNavmesh } from "./RTNavmesh";
import { RTNavmeshCellQuad } from "./RTNavmeshCell";
import { RTNavmeshEdgeGlobal, RTNavmeshEdgeInternal } from "./RTNavmeshEdge";
import { RTNavmeshInstObj } from "./RTNavmeshInstObj";
import { Vector3 } from "three";

export class RTNavmeshTerrain extends RTNavmesh {
    static terrainWidth = 1920
    static terrainHeight = 1920
    static tilesX = 96
    static tilesY = 96
    static tilesTotal = RTNavmeshTerrain.tilesX * RTNavmeshTerrain.tilesY

    constructor(regionId) {
        super(regionId);
        this.cells = [];
        this.globalEdges = []
        this.internalEdges = []
        this.objects = []

        this.points = [
            new Vector3(0, 0, 0),
            new Vector3(this.terrainWidth, 0, 0),
            new Vector3(this.terrainWidth, 0, this.terrainHeight),
            new Vector3(0, 0, this.terrainHeight)
        ]
    }

    getLine() {
        const geom = new BoxGeometry(1920, 0, 1920)
        const obj = new Mesh(geom, new MeshBasicMaterial(0xFFFFFF))
        obj.position.set(1920/2, 0, 1920/2);
        const box = new BoxHelper(obj, 0xFFFFFF)
        return box
    }

    getGeometries() {
        let geoms = [];
        this.cells.forEach(cell => {
            geoms = geoms.concat(cell.getGeometries());
        })
        // geoms.push(this.getLine())

        return geoms;
    }

    static async fromFile(file) {
        console.log('loading terrain from file ', file)
        const signature = await file.slice(0, 12).text();
        if (signature !== 'JMXVNVM 1000') {
            throw new Error('invalid signature: ', signature)
        }
        
        const buffer = await file.slice(12, file.size).arrayBuffer();
        const reader = new DataView(buffer)
        let readIndex = 0
        const objectInstanceCount = reader.getUint16(readIndex, true);
        readIndex += 2
        for (let i=0; i < objectInstanceCount; i++) {
            // TODO: add object to array
            RTNavmeshInstObj.readObj(reader, readIndex)
        }

        // TODO: assign cells
        const terrain = new RTNavmeshTerrain(this.extractRegionIdFromFilename(file))
        const cells = this.readCells(reader, readIndex, terrain, buffer)
        const globalEdges = this.readGlobalEdges(reader, readIndex, terrain, buffer)
        const internalEdges = this.readInternalEdges(reader, readIndex, terrain, buffer)
        this.readTilemap(reader, readIndex)

        terrain.cells = cells;
        terrain.globalEdges = globalEdges;
        terrain.internalEdges = internalEdges;

        console.log('terrain ' + file.name + ' has ' + terrain.cells.length + ' cells')
        console.log('terrain ' + file.name + ' has ' + terrain.globalEdges.length + ' global edges')
        console.log('terrain ' + file.name + ' has ' + terrain.internalEdges.length + ' internal edges')
        console.log('terrain ' + file.name + ' has ' + objectInstanceCount + ' objects')

        return terrain;
    }

    static extractRegionIdFromFilename(file) {
        const fileName = file.name;
        const pattern = /nv_(?<regionId>[a-z0-9]{4})\.nvm/g
        const matches = pattern.exec(fileName);

        return matches.groups.regionId; 
    }

    static readTilemap(reader, readIndex) {
        // TODO: return tiles
        for (let i=0; i < this.tilesTotal; i++) {
            const cellIndex = reader.getInt32(readIndex, true)
            const flag = reader.getInt16(readIndex+4, true)
            const textureID = reader.getInt16(readIndex+6, true)
            readIndex += 8
        }
    }

    static readGlobalEdges(reader, readIndex, mesh, buffer) {
        const edges = [];
        const amountGlobalEdges = reader.getUint32(readIndex, true);
        readIndex += 4
        for (let i=0; i < amountGlobalEdges; i++) {
            const x1 = reader.getFloat32(readIndex, true)
            const y1 = reader.getFloat32(readIndex+4, true)
            const x2 = reader.getFloat32(readIndex+8, true)
            const y2 = reader.getFloat32(readIndex+12, true)

            const flag = buffer[readIndex+16]

            const sourceDirection = buffer[readIndex+17]
            const destinationDirection = buffer[readIndex+18]

            const sourceCellIndex = reader.getUint16(readIndex + 19, true)
            const destinationCellIndex = reader.getUint16(readIndex + 21, true)

            const sourceMeshIndex = reader.getUint16(readIndex + 23, true)
            const destinationMeshIndex = reader.getUint16(readIndex + 25, true)
            const edge = new RTNavmeshEdgeGlobal(
                i,
                mesh,
                new Vector3(x1, 0, y1),
                new Vector3(x2, 0, y2),
                flag,
                sourceDirection,
                destinationDirection,
                sourceCellIndex,
                destinationCellIndex,
                sourceMeshIndex,
                destinationMeshIndex
            );
            edges.push(edge);
            readIndex += 27;
        }
        return edges;
    }

    static readInternalEdges(reader, readIndex, mesh, buffer) {
        const edges = []
        const amountGlobalEdges = reader.getInt32(readIndex, true);
        readIndex += 4
        for (let i=0; i < amountGlobalEdges; i++) {
            const x1 = reader.getFloat32(readIndex, true)
            const y1 = reader.getFloat32(readIndex+4, true)
            const x2 = reader.getFloat32(readIndex+8, true)
            const y2 = reader.getFloat32(readIndex+12, true)

            const flag = buffer[readIndex+16]

            const sourceDirection = buffer[readIndex+17]
            const destinationDirection = buffer[readIndex+18]

            const sourceCellIndex = reader.getUint16(readIndex + 19, true)
            const destinationCellIndex = reader.getUint16(readIndex + 21, true)
            const edge = new RTNavmeshEdgeInternal(
                i,
                mesh,
                new Vector3(x1, 0, y1),
                new Vector3(x2, 0, y2),
                flag,
                sourceDirection,
                destinationDirection,
                sourceCellIndex,
                destinationCellIndex
            );
            edges.push(edge);
            readIndex += 23;
        }

        return edges
    }

    static readCells(reader, readIndex, mesh, buffer) {
        const cells = [];
        const amountTotalCells = reader.getUint32(readIndex, true)
        const amountOpenCells = reader.getUint32(readIndex+4, true)
        readIndex += 8

        for (let i=0; i < amountTotalCells; i++) {
            // Read rect
            const minX = this.readFloat32(reader, readIndex, buffer)
            const minY = this.readFloat32(reader, readIndex+4, buffer)
            const maxX = this.readFloat32(reader, readIndex+8, buffer)
            const maxY = this.readFloat32(reader, readIndex+12, buffer)
            const amountCellObjects = buffer[readIndex+16]
            readIndex += 17
            for (let j=0; j < amountCellObjects; j++) {
                // add objects to cell
                const objectIndex = reader.getUint16(readIndex, true)
                readIndex += 2
            }
            // TODO: add objects
            const cell = new RTNavmeshCellQuad(
                i,
                mesh,
                new Vector3(minX, 0, minY),
                new Vector3(maxX, 0, maxY)
            )
            cells.push(cell);
        }

        return cells;
    }

    static readFloat32(reader, readIndex, buffer) {
        const num = reader.getFloat32(readIndex, true)
        // if (isNaN(num)) {
        //     return reader.getFloat32(readIndex)
        // } 

        return num
    }

    // List Cells
    // List Global Edges
    // List Internal Edges
    // List Objects
}