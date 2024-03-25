class Board {
    table = document.createElement("table");

    columns: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    squares: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    rows: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];

    constructor() {
        for (let i = 0; i < 9; i++) {
            const tr = document.createElement("tr");

            for (let j = 0; j < 9; j++) {
                const td = document.createElement("td");

                tr.appendChild(td);
                this.rows[i].push(td);
                this.columns[j].push(td);

                const square = Math.floor(i / 3) * 3 + Math.floor(j / 3);

                if (square % 2) {
                    td.classList.add("light");
                } else {
                    td.classList.add("dark");
                }

                this.squares[square].push(td);
            }

            this.table.appendChild(tr);
        }
    }

    canPlace(x: number, y: number, block: HTMLTableElement) {
        for (let i = 0; i < block.rows.length; i++) {
            for (let j = 0; j < block.rows[i].cells.length; j++) {
                if (block.rows[i].cells[j].classList.contains("empty")) {
                    continue;
                }
                const cell = this.table.rows[y + i]?.cells[x + j];

                if (!cell || cell.classList.contains("filled")) {
                    return false;
                }
            }
        }

        return true;
    }

    mark(x: number, y: number, block: HTMLTableElement, type: "highlight" | "filled") {
        for (let i = 0; i < block.rows.length; i++) {
            for (let j = 0; j < block.rows[i].cells.length; j++) {
                if (!block.rows[i].cells[j].classList.contains("empty")) {
                    this.table.rows[y + i].cells[x + j].classList.add(type);
                }
            }
        }
    }

    pop(previous: number, group: HTMLTableCellElement[]) {
        if (group.every(td => td.classList.contains("filled"))) {
            for (const td of group) {
                td.style.setProperty("transition-delay", `${previous / 20}s`);
                td.style.setProperty("transition-duration", `${group.length / 20}s`);
                td.style.setProperty("transition-property", "opacity");
                window.setTimeout(
                    function () {
                        td.style.removeProperty("transition-delay");
                        td.style.removeProperty("transition-duration");
                        td.style.removeProperty("transition-property");
                    },
                    (previous + group.length) * 50
                );
                td.classList.remove("filled");
            }

            return previous + group.length;
        }

        return previous;
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

    clearHighlight() {
        for (const cell of this.table.querySelectorAll("td.highlight")) {
            cell.classList.remove("highlight");
        }
    }

    clearFilled() {
        return this.columns.reduce(this.pop, this.rows.reduce(this.pop, this.squares.reduce(this.pop, 0)));
    }

    positionFor(dom: HTMLElement) {
        const bbox = dom.getBoundingClientRect();

        for (let i = 0; i < this.table.rows.length; i++) {
            for (let j = 0; j < this.table.rows[i].cells.length; j++) {
                const tdBBOX = this.table.rows[i].cells[j].getBoundingClientRect();
                const threshold = tdBBOX.width * 0.75;

                if (
                    Math.abs(tdBBOX.left - bbox.left) < threshold &&
                    Math.abs(tdBBOX.top - bbox.top) < threshold
                ) {
                    return [j, i] as [number, number];
                }
            }
        }

        return null;
    }
}
