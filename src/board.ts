export default class Board {
    table = document.createElement("table");
    subTables: HTMLTableElement[] = [];

    columns: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    rows: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    squares: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];

    constructor() {
        this.table.className = "main";
        for (let i = 0; i < 3; i++) {
            const tr = document.createElement("tr");
            for (let j = 0; j < 3; j++) {
                const subTable = document.createElement("table");
                subTable.classList.add("subgrid");
                this.subTables.push(subTable);
                const subTbody = document.createElement("tbody");
                subTable.appendChild(subTbody);
                for (let k = 0; k < 3; k++) {
                    const subTr = document.createElement("tr");
                    for (let l = 0; l < 3; l++) {
                        const td = document.createElement("td");
                        td.className = "boardShape";

                        subTr.appendChild(td);
                        const row = i * 3 + k;
                        const col = j * 3 + l;
                        this.rows[row].push(td);
                        this.columns[col].push(td);
                        const square = i * 3 + j;
                        if ((square+1) % 2) {
                            subTable.classList.add("dark");
                        }
                        this.squares[square].push(td);
                    }
                    subTbody.appendChild(subTr);
                }
                tr.appendChild(subTable);
            }
            this.table.appendChild(tr);
        }
    }

    getFieldFor(block: HTMLTableElement) {
        const blockBBOX = block.getBoundingClientRect();
        for (let i = 0; i < this.subTables.length; i++) {
            const subTable = this.subTables[i];
            for (let j = 0; j < subTable.rows.length; j++) {
                for (let k = 0; k < subTable.rows[j].cells.length; k++) {
                    const tdBBOX = subTable.rows[j].cells[k].getBoundingClientRect();
                    const threshold = 20;
                    if (
                        Math.abs(tdBBOX.left - blockBBOX.left) < threshold &&
                        Math.abs(tdBBOX.top - blockBBOX.top) < threshold
                    ) {
                        return [k + (i % 3) * 3, j + Math.floor(i / 3) * 3] as [number, number];
                    }
                }
            }
        }

        return null;
    }

    canPlace(x: number, y: number, block: HTMLTableElement) {
        for (let i = 0; i < block.rows.length; i++) {
            for (let j = 0; j < block.rows[i].cells.length; j++) {
                if (block.rows[i].cells[j].classList.contains("empty")) {
                    continue;
                }
                const cell = this.rows[y + i]?.[x + j];
                if (!cell || (cell.classList.contains("filled") && !cell.classList.contains("animation"))) {
                    return false;
                }
            }
        }

        return true;
    }

    mark(x: number, y: number, block: HTMLTableElement, type: "highlight" | "filled"): HTMLTableCellElement[] {
        const ret = [];
        for (let i = 0; i < block.rows.length; i++) {
            for (let j = 0; j < block.rows[i].cells.length; j++) {
                if (!block.rows[i].cells[j].classList.contains("empty")) {
                    this.rows[y + i][x + j].classList.add(type);
                    ret.push(this.rows[y + i][x + j]);
                }
            }
        }
        return ret;
    }


    isDisabled(block: HTMLTableElement) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.canPlace(j, i, block)) {
                    return false;
                }
            }
        }

        return true;
    }

    clearHighlights() {
        for (const cell of this.table.querySelectorAll("td.highlight,td.match")) {
            cell.classList.remove("highlight");
            cell.classList.remove("match");
        }
    }

    clearFilled() {
        const app = this.table.closest<HTMLElement>(".app")?.style
        const animation = app.getPropertyValue("--animation") || "none";
        const gradual = +app.getPropertyValue("--gradual") || 0;
        // const gradual = this.settings.querySelector<HTMLInputElement>("#gradual")!;
        // const gradual = {checked:true};
        let previous = 0;
        const completing = this.getCompleting();
        const combo = completing.length;
        if (combo > 1) {
            this.showCombo(combo);
        }
        for (const group of completing) {
            for (let index = 0; index < group.length; index++) {
                const td = group[index];
                td.classList.add('animation');
                if (animation !== "none") {
                    const timeout = gradual ? ((index / group.length) * 1000) : 0;
                    window.setTimeout(() => {
                        td.classList.remove("filled");
                        td.classList.remove('animation');
                        td.classList.add(animation);
                        window.setTimeout(() => {
                            td.classList.remove(animation);
                        }, 1000);
                    }, timeout);
                }
                else {
                    td.classList.remove("filled");
                }
            }
            previous += group.length;
        }
        return previous * combo;
    }

    showCombo(combo:number){
        const app = this.table.closest<HTMLElement>(".app")!;
        const comboDisplay = document.createElement("div");
        comboDisplay.classList.add("combo-popup");
        comboDisplay.textContent = `Combo X${combo}!`;
        app.appendChild(comboDisplay);
        setTimeout(() => {
            comboDisplay.remove();
        }, 1000);
    }

    getCompleting(block: HTMLTableCellElement[] = []): HTMLTableCellElement[][] {
        const findCompletions = group => group.every(td => (td.classList.contains("filled") && !td.classList.contains("animation")) || block.includes(td));
        return [...this.columns.filter(findCompletions), ...this.rows.filter(findCompletions), ...this.squares.filter(findCompletions, 0)];
    }

    positionFor(dom: HTMLElement) {
        const bbox = dom.getBoundingClientRect();
        for (let i = 0; i < this.subTables.length; i++) {
            const subTable = this.subTables[i];
            for (let j = 0; j < subTable.rows.length; j++) {
                for (let k = 0; k < subTable.rows[j].cells.length; k++) {
                    const tdBBOX = subTable.rows[j].cells[k].getBoundingClientRect();
                    const threshold = tdBBOX.width * 0.75;
                    if (
                        Math.abs(tdBBOX.left - bbox.left) < threshold &&
                        Math.abs(tdBBOX.top - bbox.top) < threshold
                    ) {
                        return [k + (i % 3) * 3, j + Math.floor(i / 3) * 3] as [number, number];
                    }
                }
            }
        }

        return null;
    }
}
