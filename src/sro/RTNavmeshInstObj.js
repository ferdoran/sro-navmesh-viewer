export class RTNavmeshInstObj {
    static readObj(reader, readIndex) {
        const index = reader.getInt32(readIndex, true)
        const x = reader.getFloat32(readIndex+4, true)
        const y = reader.getFloat32(readIndex+8, true)
        const z = reader.getFloat32(readIndex+12, true)
        const type = reader.getInt16(readIndex+16, true)
        readIndex += 18

        const yaw = reader.getFloat32(readIndex, true)
        const id = reader.getUint16(readIndex+4, true)
        const unknown = reader.getUint16(readIndex+6, true)
        const isLarge = reader.getInt8(readIndex+8, true)
        const isStructure = reader.getInt8(readIndex+9, true)
        readIndex += 10
        
        const regionId = reader.getUint16(readIndex, true)
        readIndex += 2
        
        const amountLinkedEdges = reader.getInt16(readIndex, true)
        readIndex += 2

        // TODO: calculate rotation and matrices
        for (let i=0; i < amountLinkedEdges; i++) {
            const linkedObjId = reader.getInt16(readIndex, true)
            const linkedObjEdgeId = reader.getInt16(readIndex+2, true)
            const linkedEdgeId = reader.getInt16(readIndex+4, true)
            readIndex += 6
        }
        // TODO: return obj instance
    }
}