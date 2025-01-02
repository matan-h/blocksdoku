import "./block";
import "./board";
import Game from "./game";
import { registerSW } from 'virtual:pwa-register'

const game = new Game();

document.body.append(game.app);

registerSW({ immediate: true })
