import { Line, BufferGeometry, LineBasicMaterial, Vector3 } from "three";
import { RTNavmeshEdgeGlobal } from "./RTNavmeshEdge";
export class RTNavmeshCell {
    constructor(index, mesh) {
        this.index = index;
        this.mesh = mesh;
        this.edges = [];
    }
}

export class RTNavmeshCellQuad extends RTNavmeshCell {
    constructor(index, mesh, p1, p2) {
        super(index, mesh);
        this.objects = [];
        this.p1 = p1;
        this.p2 = p2;
    }

    getGeometries() {
        const geoms = []
        const x1 = this.p1.x
        const x2 = this.p2.x
        const y1 = this.p1.z
        const y2 = this.p2.z

        const edge1 = new BufferGeometry().setFromPoints([
            new Vector3(x1, 0, y1),
            new Vector3(x2, 0, y1)
        ])
        edge1.name = 'Cell ' + this.index + ' edge 1'
        
        const edge2 = new BufferGeometry().setFromPoints([
            new Vector3(x2, 0, y1),
            new Vector3(x2, 0, y2)
        ])
        edge2.name = 'Cell ' + this.index + ' edge 2'
        
        const edge3 = new BufferGeometry().setFromPoints([
            new Vector3(x2, 0, y2),
            new Vector3(x1, 0, y2)
        ])
        edge3.name = 'Cell ' + this.index + ' edge 3'
        
        const edge4 = new BufferGeometry().setFromPoints([
            new Vector3(x1, 0, y2),
            new Vector3(x1, 0, y1)
        ])
        edge4.name = 'Cell ' + this.index + ' edge 4'

        const material = new LineBasicMaterial({color: 0x0000EE, linewidth: 4})
        
        geoms.push(
            new Line(edge1, material),
            new Line(edge2, material),
            new Line(edge3, material),
            new Line(edge4, material),
        )

        return geoms;
    }
}