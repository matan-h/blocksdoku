export default class Block {
    shape: boolean[][];

    constructor(...shape: boolean[][]) {
        this.shape = shape;
    }

    toHTML() {
        const table = document.createElement("table");
        table.classList.add("block");

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        for (const row of this.shape) {
            const tr = document.createElement("tr");
            tbody.appendChild(tr);

            for (const cell of row) {
                const td = document.createElement("td");
                td.className = "selectShape"
                td.classList.toggle("empty", !cell);
                td.classList.add("filled");

                tr.appendChild(td);
            }
        }

        return table;
    }
}