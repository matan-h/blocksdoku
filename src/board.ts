export default class Board {
    table = document.createElement("table");

    columns: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    squares: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];
    rows: HTMLTableCellElement[][] = [[], [], [], [], [], [], [], [], []];

    constructor() {
        this.table.className = "main";
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

    getFieldFor(block: HTMLTableElement) {
        const blockBBOX = block.getBoundingClientRect();

        for (let i = 0; i < this.table.rows.length; i++) {
            for (let j = 0; j < this.table.rows[i].cells.length; j++) {
                const tdBBOX = this.table.rows[i].cells[j].getBoundingClientRect();
                const threshold = 20;

                if (
                    Math.abs(tdBBOX.left - blockBBOX.left) < threshold &&
                    Math.abs(tdBBOX.top - blockBBOX.top) < threshold
                ) {
                    return [j, i] as [number, number];
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
                const cell = this.table.rows[y + i]?.cells[x + j];

                if (!cell || cell.classList.contains("filled")) {
                    return false;
                }
            }
        }

        return true;
    }

    mark(x: number, y: number, block: HTMLTableElement, type: "highlight" | "filled") : HTMLTableCellElement[]{
        const ret = [];
        for (let i = 0; i < block.rows.length; i++) {
            for (let j = 0; j < block.rows[i].cells.length; j++) {
                if (!block.rows[i].cells[j].classList.contains("empty")) {
                    this.table.rows[y + i].cells[x + j].classList.add(type);
                    ret.push(this.table.rows[y + i].cells[x + j])
                }
            }
        }
        return ret
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
        if(combo > 1){
            this.showCombo(combo);
        }
        for (const group of completing) {
            for (let index = 0; index < group.length; index++) {
                const td = group[index];
                if(animation !== "none"){
                    const timeout = gradual ? ((index/group.length)*1000) : 0;
                    window.setTimeout(() => {
                        td.classList.remove("filled");

                        td.classList.add(animation);
                        window.setTimeout(() => {
                            td.classList.remove(animation);
                        }, 1000);
                    }, timeout);
                }
                else{
                    td.classList.remove("filled");
                }
            }
            previous += group.length;
        }
        return previous*combo;
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

    getCompleting(block:HTMLTableCellElement[]=[]) : HTMLTableCellElement[][]{
        const findCompletions =  group=>group.every(td => td.classList.contains("filled")||block.includes(td));

        return [...this.columns.filter(findCompletions),... this.rows.filter(findCompletions),...this.squares.filter(findCompletions, 0)];
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
