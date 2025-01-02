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
        const container = document.createElement("div");
        container.className = 'panel'
        container.append(this.panel);


        this.app.classList.add("app");

        this.panel.addEventListener("touchstart", this, { passive: false });
        this.panel.addEventListener("mousedown", this);
        this.app.append(this.board.table, container, this.settingsButton);
        this.fill();
        this.createSettingsDialog();

        this.gameOver.innerHTML = `
            <h1>Game Over</h1>
            <form method="dialog" class="score">
                <div id="highScore"></div>
                <button type="submit">Reset</button>
            </form>
        `;
        
        this.gameOver.onclose = () => this.reset();
        this.settingsButton.textContent = "Settings";
        this.settingsButton.addEventListener("click", () => this.settings.showModal());
        this.app.append(this.gameOver);
        this.createHighScoreDisplay();
        this.loadHighScore();
    }

    createHighScoreDisplay() {
        const highScoreDisplay = document.createElement("div");
        highScoreDisplay.classList.add("high-score");
        this.app.appendChild(highScoreDisplay);
    }

    createSettingsDialog() {
        this.settings.innerHTML = `
            <h1>Settings</h1>
            <form method="dialog">
                <div class="setting">
                    <label>Theme</label>
                    <label class="color" for="theme" style="background-color:#3030ff"></label>
                    <input type="color" value="#3030ff" id="theme"/>
                </div>
                <div class="setting">
                    <label>Animation</label>
                    <select id="animation">
                        <option value="none">None</option>
                        <option value="fade-out">Fade out</option>
                        <option value="explode">Explode</option>
                        <option value="ripple">Ripple</option>
                        <option value="spin" selected>Spin</option>
                        <option value="swirl">Swirl</option>
                        <option value="colorswirl">Color Swirl</option>
                    </select>
                </div>
                 <div class="setting">
                    <label>Gradual Animation</label>
                    <input type="checkbox" id="gradual" />
                </div>
                <button type="submit">OK</button>
                <button type="reset">Reset</button>
            </form>
        `;

        const theme = this.settings.querySelector<HTMLInputElement>("#theme")!;
        const animation = this.settings.querySelector<HTMLSelectElement>("#animation")!;
        const gradual = this.settings.querySelector<HTMLInputElement>("#gradual")!;

        const saved = localStorage.getItem("settings");
        if (saved) {
            const settings = JSON.parse(saved);
            theme.value = settings.theme;
            animation.value = settings.animation;
            gradual.checked = settings.gradual;
            this.updateTheme(theme.value);
            this.settings.querySelector<HTMLLabelElement>('label.color')!.style.backgroundColor = theme.value;
        }

        this.app.style.setProperty("--animation", animation.value);
        this.app.style.setProperty("--gradual", ''+(+gradual.checked));

        theme.oninput = () => {
            this.updateTheme(theme.value);
            this.settings.querySelector<HTMLLabelElement>('label.color')!.style.backgroundColor = theme.value;
            this.saveSettings();
        };
        animation.oninput = () => {
            this.app.style.setProperty("--animation", animation.value);
            this.saveSettings();
        };
        gradual.oninput = () => {
            this.app.style.setProperty("--gradual", ''+(+gradual.checked)); // bool->int->str
            this.saveSettings();
        }

        const resetButton = this.settings.querySelector<HTMLButtonElement>('button[type="reset"]')!;
        resetButton.onclick = () => {
            localStorage.clear();
            window.location.reload();
        };

        this.app.append(this.settings);
    }

    saveSettings() {
        const theme = this.settings.querySelector<HTMLInputElement>("#theme")!;
        const animation = this.settings.querySelector<HTMLSelectElement>("#animation")!;
        const gradual = this.settings.querySelector<HTMLInputElement>("#gradual")!;
        localStorage.setItem(
            "settings",
            JSON.stringify({
                theme: theme.value,
                animation: animation.value,
                gradual: gradual.checked
            })
        );
    }

    updateTheme(color: string) {
        this.app.style.setProperty("--color", color);
    }

    set score(value: number) {
        this.app.style.setProperty("--score", `${value}`);
        if (value > this.highScore) {
            this.highScore = value;
            this.saveHighScore();
        }
    }

    get score() {
        return +this.app.style.getPropertyValue("--score");
    }

    set highScore(value: number) {
        this.gameOver.querySelector<HTMLDivElement>("#highScore")!.textContent = `High Score: ${value}`;
        this._highScore = value;
        this.app.querySelector<HTMLDivElement>(".high-score")!.textContent = `High Score: ${value}`;
    }

    get highScore() {
        return this._highScore;
    }

    private _highScore = 0;

    loadHighScore() {
        const saved = localStorage.getItem("highScore");
        if (saved) {
            if (saved==='matan-h'){ // there is no way to get here from the game as matan-h would be charpoint 678 = U+2A6
                const message = document.createElement('h1');
                message.textContent = "No way... thats the coolest name ever, in your high score...";
                message.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 5em;
                    color: blue;
                    font-weight: bold;
                    background-color: rgba(255, 255, 255, 0.9);
                    z-index: 1000;
                    text-align:center;
                    --e-aster-egg: true;
                `;
                this.app.prepend(message);
                setTimeout(() => {
                    message.remove();
                }, 5000);
            }
            this.highScore = this.decodeHighScore(saved);
        }
        this.app.querySelector<HTMLDivElement>(".high-score")!.textContent = `High Score: ${this.highScore}`;
    }

    saveHighScore() {
        localStorage.setItem("highScore", this.encodeHighScore(this.highScore));
    }

    encodeHighScore(score: number): string {
        // that is an e aster egg :)
        let encoded = "";
        while (score > 0) {
            const charCode = Math.min(score, 65535);
            encoded += String.fromCharCode(charCode);
            score -= charCode;
        }
        return encoded;
    }

    decodeHighScore(encoded: string): number {
        let score = 0;
        for (let i = 0; i < encoded.length; i++) {
            score += encoded.charCodeAt(i);
        }
        return score;
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
        const highlight = (field: [number, number]
        ) =>{
            if (field && this.board.canPlace(...field, table)) {
                let mark = this.board.mark(...field, table, "highlight");
                this.board.getCompleting(mark).forEach(e=>e.forEach(el=>el.classList.add("match")))
            }
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

                const field = this.board.getFieldFor(table);

                table.style.setProperty("--dx", `${x + event.movementX}`);
                table.style.setProperty("--dy", `${y + event.movementY}`);

                this.board.clearHighlights();
                highlight(field)
            };

            mouseUp = (event: MouseEvent) => {
                event.preventDefault();

                document.removeEventListener("mousemove", mouseMove);
                document.removeEventListener("mouseup", mouseUp);

                const field = this.board.getFieldFor(table);

                table.style.removeProperty("--dx");
                table.style.removeProperty("--dy");

                if (field && this.board.canPlace(...field, table)) {
                    this.score += table.querySelectorAll("td:not(.empty)").length;
                    this.board.mark(...field, table, "filled");

                    table.classList.add("used");
                    this.score += this.board.clearFilled();
                    this.check();

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

            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        } else if (event instanceof TouchEvent) {

            mouseMove = (event: TouchEvent) => {
                event.preventDefault();

                const x = +table.style.getPropertyValue("--dx");
                const y = +table.style.getPropertyValue("--dy");

                const touch = event.changedTouches[0];
                const target = touch.target as HTMLElement;

                const field = this.board.getFieldFor(table);

                table.style.setProperty("--dx", `${x + touch.clientX - (target.getBoundingClientRect().left + (table.offsetWidth / 2))}`);
                table.style.setProperty("--dy", `${y + touch.clientY - (target.getBoundingClientRect().top + (table.offsetHeight / 2))}`);

                this.board.clearHighlights();
                highlight(field)
            };

            mouseUp = () => {
                document.removeEventListener("touchmove", mouseMove);
                document.removeEventListener("touchend", mouseUp);

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

            document.addEventListener("touchmove", mouseMove, { passive: false });
            document.addEventListener("touchend", mouseUp);
        }
    }
    

    check() {
        const tables = this.panel.querySelectorAll<HTMLTableElement>("table:not(.used)");
        if (!tables.length) return false;
        let over = true;

        for (const table of tables) {
            const isDisabled = this.board.isDisabled(table);
            table.classList.toggle("disabled", isDisabled);
            over = over && isDisabled;
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

}
