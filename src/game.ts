class Game {
    settings = document.createElement("dialog");
    gameOver = document.createElement("dialog");
    panel = document.createElement("div");
    app = document.createElement("div");
    settingsButton = document.createElement("button");
    board = new Board();

    blocks = [
        new Block([true]),
        new Block([true, true]),
        new Block([true, true, true]),
        new Block([true], [true]),
        new Block([true], [true], [true]),

        new Block([true, true], [true, true]),

        new Block([false, true, true], [true, true]),
        new Block([true, true], [true]),
        new Block([true], [true, true]),

        new Block([true, true, true], [false, false, true], [false, false, true]),
        new Block([false, true], [true, true, true]),
        new Block([false, true], [true])
    ];

    constructor() {
        const aside = document.createElement("aside");
        const blank = document.createElement("div");
        aside.append(blank, this.panel);


        this.app.classList.add("app");

        this.panel.addEventListener("touchstart", this);
        this.panel.addEventListener("mousedown", this);
        this.app.style.setProperty("--color", "#3030FF");
        this.app.append(this.board.table, aside, this.settingsButton);
        this.fill();
        this.createSettingsDialog();

        this.gameOver.innerHTML = `
            <h1>Game Over</h1>
            <h2>Result</h2>
            <form method="dialog" class="score">
                <button type="submit">Reset</button>
            </form>
        `;
        
        this.gameOver.onclose = () => this.reset();
        this.settingsButton.textContent = "Settings";
        this.settingsButton.addEventListener("click", () => this.settings.showModal());
        this.app.append(this.gameOver);
    }

    createSettingsDialog() {
        this.settings.innerHTML = '<h1>Settings</h1><h2>Theme</h2>';
        const input = document.createElement("input");
        input.type = "color";
        input.value = "#3030ff";

        const label = document.createElement("label");
        label.classList.add("color");
        label.appendChild(input);

        const form = document.createElement("form");
        form.method = "dialog";
        form.appendChild(label);

        const ok = document.createElement("button");
        ok.type = "submit";
        ok.textContent = "OK";

        form.appendChild(ok);
        this.settings.appendChild(form);

        input.oninput = () => this.app.style.setProperty("--color", input.value);

        this.app.append(this.settings);
    }

    getFieldFor(block: HTMLTableElement) {
        const blockBBOX = block.getBoundingClientRect();

        for (let i = 0; i < this.board.table.rows.length; i++) {
            for (let j = 0; j < this.board.table.rows[i].cells.length; j++) {
                const tdBBOX = this.board.table.rows[i].cells[j].getBoundingClientRect();
                const threshold = 10;

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

    set score(value: number) {
        this.app.style.setProperty("--score", `${value}`);
    }

    get score() {
        return +this.app.style.getPropertyValue("--score");
    }

    fill() {
        const blocks = this.blocks.slice();

        blocks.sort(() => Math.random() - 0.5);
        blocks.splice(3);

        for (const block of blocks) {
            this.panel.appendChild(block.toHTML());
        }

        this.check();
    }

    handleEvent(event: MouseEvent | TouchEvent) {
        event.preventDefault();

        const target = event.target as HTMLElement;
        const table = target.closest("table")!;

        if (target.tagName !== "TD") {
            return;
        }

        let mouseMove: (event: MouseEvent | TouchEvent) => void;
        let mouseUp: (event: MouseEvent | TouchEvent) => void;

        if (event instanceof MouseEvent) {
            if (event.button !== 0) {
                return;
            }

            mouseMove = (event: MouseEvent) => {
                event.preventDefault();

                const x = +table.style.getPropertyValue("--dx");
                const y = +table.style.getPropertyValue("--dy");

                const field = this.getFieldFor(table);

                table.style.setProperty("--dx", `${x + event.movementX}`);
                table.style.setProperty("--dy", `${y + event.movementY}`);

                this.board.clearHighlight();

                if (field && this.board.canPlace(...field, table)) {
                    this.board.mark(...field, table, "highlight");
                }
            };

            mouseUp = (event: MouseEvent) => {
                event.preventDefault();

                document.removeEventListener("mousemove", mouseMove);
                document.removeEventListener("mouseup", mouseUp);

                const field = this.getFieldFor(table);

                table.style.removeProperty("--dx");
                table.style.removeProperty("--dy");

                if (field && this.board.canPlace(...field, table)) {
                    this.score += table.querySelectorAll("td:not(.empty)").length;
                    this.board.mark(...field, table, "filled");

                    this.check();
                    table.classList.add("used");

                    this.score += this.board.clearFilled();
                }

                this.board.clearHighlight();

                for (const child of this.panel.children) {
                    if (!child.classList.contains("used")) {
                        return;
                    }
                }

                this.panel.innerHTML = "";
                this.fill();
            };

            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        } else if (event instanceof TouchEvent) {
            const touch = event.changedTouches[0];

            mouseMove = (event: TouchEvent) => {
                event.preventDefault();

                const x = +table.style.getPropertyValue("--dx");
                const y = +table.style.getPropertyValue("--dy");

                const touch = event.changedTouches[0];
                const target = touch.target as HTMLElement;

                const field = this.getFieldFor(table);

                table.style.setProperty("--dx", `${x + touch.clientX - (target.getBoundingClientRect().left + (table.offsetWidth / 2))}`);
                table.style.setProperty("--dy", `${y + touch.clientY - (target.getBoundingClientRect().top + (table.offsetHeight / 2))}`);

                this.board.clearHighlight();

                if (field && this.board.canPlace(...field, table)) {
                    this.board.mark(...field, table, "highlight");
                }
            };

            mouseUp = (event: TouchEvent) => {
                event.preventDefault();

                document.removeEventListener("touchmove", mouseMove);
                document.removeEventListener("touchend", mouseUp);

                const field = this.getFieldFor(table);

                table.style.removeProperty("--dx");
                table.style.removeProperty("--dy");

                if (field && this.board.canPlace(...field, table)) {
                    this.score += table.querySelectorAll("td:not(.empty)").length;
                    this.board.mark(...field, table, "filled");

                    this.check();
                    table.classList.add("used");

                    this.score += this.board.clearFilled();
                }

                this.board.clearHighlight();

                for (const child of this.panel.children) {
                    if (!child.classList.contains("used")) {
                        return;
                    }
                }

                this.panel.innerHTML = "";
                this.fill();
            };

            document.addEventListener("touchmove", mouseMove);
            document.addEventListener("touchend", mouseUp);
        }
    }

    check() {
        const tables = this.panel.querySelectorAll<HTMLTableElement>("table:not(.used)");
        let over = true;

        for (const table of tables) {
            over &&= table.classList.toggle("disabled", this.board.isDisabled(table));
        }

        over && setTimeout(() => this.gameOver.showModal(), 1000);
    }

    reset() {
        this.score = 0;

        for (const cell of this.board.table.querySelectorAll("td.filled")) {
            cell.classList.remove("filled");
        }

        this.panel.innerHTML = "";
        this.fill();
    }

    private static blockTouch(event: TouchEvent) {
        event.preventDefault();
    }
}
