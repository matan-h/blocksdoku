import Block from "./block";
import Board from "./board";

export default class Game {
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
        const aside = document.createElement("div");
        const blank = document.createElement("div");
        aside.append(blank, this.panel);


        this.app.classList.add("app");

        this.panel.addEventListener("touchstart", this, { passive: false });
        this.panel.addEventListener("mousedown", this);
        this.app.style.setProperty("--color", "#3030FF");
        this.app.append(this.board.table, aside, this.settingsButton);
        this.fill();
        this.createSettingsDialog();

        this.gameOver.innerHTML = `
            <h1>Game Over</h1>
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

        const animation = document.createElement("select");
        animation.innerHTML = `
            <option value="none">None</option>
            <option value="shatter">Shatter</option>
            <option value="explode">Explode</option>
            <option value="ripple">Ripple</option>
            <option value="spin">Spin</option>
        `;
        animation.value = "shatter";
        const animationLabel = document.createElement("label");
        animationLabel.textContent = "Animation";
        animationLabel.appendChild(animation);

        const label = document.createElement("label");
        label.classList.add("color");
        label.appendChild(input);
        

        const form = document.createElement("form");
        form.method = "dialog";
        form.appendChild(label);
        form.appendChild(animationLabel);

        const ok = document.createElement("button");
        ok.type = "submit";
        ok.textContent = "OK";

        form.appendChild(ok);
        this.settings.appendChild(form);

        input.oninput = () => this.app.style.setProperty("--color", input.value);
        animation.oninput = () => this.app.style.setProperty("--animation", animation.value);
        this.app.style.setProperty("--animation", animation.value);

        this.app.append(this.settings);
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
    
        const handleMove = (dx: number, dy: number) => {
            const x = +table.style.getPropertyValue("--dx");
            const y = +table.style.getPropertyValue("--dy");
    
            const field = this.board.getFieldFor(table);
    
            table.style.setProperty("--dx", `${x + dx}`);
            table.style.setProperty("--dy", `${y + dy}`);
    
            this.board.clearHighlights();
    
            if (field && this.board.canPlace(...field, table)) {
                const mark = this.board.mark(...field, table, "highlight");
                this.board.getCompleting(mark).forEach(row =>
                    row.forEach(cell => cell.classList.add("match"))
                );
            }
        };
    
        const handleUp = () => {
            const field = this.board.getFieldFor(table);
    
            table.style.removeProperty("--dx");
            table.style.removeProperty("--dy");
    
            if (field && this.board.canPlace(...field, table)) {
                this.score += table.querySelectorAll("td:not(.empty)").length;
                this.board.mark(...field, table, "filled");
    
                this.check();
                table.classList.add("used");
    
                this.score += this.board.clearFilled();
            }
    
            this.board.clearHighlights();
    
            for (const child of this.panel.children) {
                if (!child.classList.contains("used")) {
                    return;
                }
            }
    
            this.panel.innerHTML = "";
            this.fill();
        };
    
        let moveHandler: (event: MouseEvent | TouchEvent) => void;
        let upHandler: (event: MouseEvent | TouchEvent) => void;
    
        if (event instanceof MouseEvent) {
            if (event.button !== 0) {
                return;
            }
    
            moveHandler = (e: MouseEvent) => {
                e.preventDefault();
                handleMove(e.movementX, e.movementY);
            };
    
            upHandler = (e: MouseEvent) => {
                e.preventDefault();
                document.removeEventListener("mousemove", moveHandler);
                document.removeEventListener("mouseup", upHandler);
                handleUp();
            };
    
            document.addEventListener("mousemove", moveHandler);
            document.addEventListener("mouseup", upHandler);
        } else if (event instanceof TouchEvent) {
            const touchStart = event.changedTouches[0];
            const initialRect = table.getBoundingClientRect();
            const initialOffsetX = initialRect.left + table.offsetWidth / 2;
            const initialOffsetY = initialRect.top + table.offsetHeight / 2;
    
            moveHandler = (e: TouchEvent) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                handleMove(
                    touch.clientX - initialOffsetX,
                    touch.clientY - initialOffsetY
                );
            };
    
            upHandler = (e: TouchEvent) => {
                document.removeEventListener("touchmove", moveHandler);
                document.removeEventListener("touchend", upHandler);
                handleUp();
            };
    
            document.addEventListener("touchmove", moveHandler, { passive: false });
            document.addEventListener("touchend", upHandler);
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
