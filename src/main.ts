const game = new Game();

game.app.style.setProperty("position", "absolute");
game.app.style.setProperty("left", "0");
game.app.style.setProperty("top", "0");
game.app.style.setProperty("width", "100%");
game.app.style.setProperty("height", "100%");

document.body.append(game.app);
