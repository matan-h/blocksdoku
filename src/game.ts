import Block from "./block";
import Board from "./board";

export default class Game {
    settings = document.createElement("dialog");
    gameOver = document.createElement("dialog");
    panel = document.createElement("div");
    app = document.createElement("div");
    settingsButton = document.createElement("button");
    resetButton = document.createElement("button");
    board = new Board();
    settingsButtonSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 .51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1h.09a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-.51 1z"></path>
        </svg>
    `;
    resetButtonSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-rotate-ccw">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
    `;

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
        new Block([false, true], [true]),
        //
        new Block([true], [true], [true, true]), 
        new Block([false, false, true], [false, true], [true]),
        new Block([true], [false, true], [false, false, true])

    ];

    constructor() {
        this.resetButton.id = "resetButton";

        const container = document.createElement("div");
        container.className = 'panel'
        container.append(this.panel);


        this.app.classList.add("app");

        this.panel.addEventListener("touchstart", this, { passive: false });
        this.panel.addEventListener("mousedown", this);
        this.app.append(this.board.table, container, this.settingsButton, this.resetButton);
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
        this.settingsButton.innerHTML = this.settingsButtonSVG;
        this.settingsButton.addEventListener("click", () => this.settings.showModal());
        this.resetButton.innerHTML = this.resetButtonSVG;
        this.resetButton.addEventListener("click", () => this.reset());
        this.app.append(this.gameOver);
        this.createHighScoreDisplay();
        this.loadHighScore();
        this.createFooter();
    }

    createHighScoreDisplay() {
        const highScoreDisplay = document.createElement("div");
        highScoreDisplay.classList.add("high-score");
        this.app.appendChild(highScoreDisplay);
    }

    createFooter() {
        const footer = document.createElement("footer");
        footer.innerHTML = `
            <p>
                <a href="https://github.com/matan-h/blocksdoku">This game</a> is a fork of <a href="https://github.com/tomaswrobel/blocksdoku">BlocksDoku</a>,
                which is inspired by Blockudoku.
            </p>
        `;
        this.app.appendChild(footer);
    }

    createSettingsDialog() {
        this.settings.innerHTML = `
            <h1>Settings</h1>
            <form method="dialog">
                <div class="setting">
                    <label>Theme</label>
                    <label class="color" for="theme" style="background-color:#2c95af"></label>
                    <input type="color" value="#2c95af" id="theme"/>
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
            localStorage.removeItem("settings");
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

    hexToRgba(hex:string, opacity:number) {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');
    
        // Parse r, g, b values
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
    
        // Return the rgba string
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    updateTheme(color: string) {
        this.app.style.setProperty("--color", color);
        this.app.style.setProperty("--subgrid-color", this.hexToRgba(color, 0.3));
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
