import * as WebSocket from 'ws';
import { IncomingMessage } from 'http'
import { URL } from 'url';
import { Board, Dimension, Piece } from './ttt';

const PORT = 8869;

declare const process: any;

type Player = {
    side: Piece,
    ws: WebSocket
};

class ServerBoard extends Board {
    private players: Player[] = [];
    private code: string;

    constructor(code: string) {
        super(Dimension.FOUR);
        this.code = code;

        console.log("new board", code);
    }

    empty(): boolean {
        return this.players.length == 0;
    }

    add_player(ws: WebSocket) {

        const sides = this.players.map(p => p.side);

        const player: Player = {
            side: !sides.includes(Piece.X) ? Piece.X : !sides.includes(Piece.O) ? Piece.O : null,
            ws: ws
        };

        ws.on('message', data => {
            this.onmessage(player, data);
        });

        ws.on('close', () => {
            console.log("disconnect", ws._socket.remoteAddress);

            const index = this.players.indexOf(player);
            if(index >= 0)
                this.players.splice(index, 1);
        });

        if(this.players.length == 0) {
            this.send(ws, 'first');
        } else {
            this.send_board(ws);
        }

        this.send(ws, 'side', player.side);

        console.log("new player", player.side, ws._socket.remoteAddress);

        this.players.push(player);
    }

    onmessage(player: Player, json: string) {
        const data = JSON.parse(json);

        switch(data[0]) {
            case 'reset':
                super.reset(data[1]);
                break;
            case 'put_piece':
                if(player.side == this.cur_piece) {
                    this.select = data[1];
                    super.put_piece();
                }
                break;
        }

        this.send_to_all();
    }

    send(ws, ...args: any[]) {
        if(ws?.readyState == WebSocket.OPEN)
            ws.send(JSON.stringify(args));
    }

    send_board(ws?: WebSocket) {
        this.send(ws, 'board', this.serialize());
    }

    send_to_all() {
        this.players.map(p => p.ws).forEach(ws => this.send_board(ws));
    }
}

function main() {

    const wss = new WebSocket.Server({
        port: process.env.PORT ?? PORT
    });

    const boards = new Map<string, ServerBoard>();

    const remove_empty = function() {
        for(let [code, board] of boards) {
            if(board.empty()) {
                console.log("removing board", code);
                boards.delete(code);
            }
        }
    }

    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const code = req.url.replace(/^\/+/, '');

        if(code === '')
            return;

        if(boards.has(code)) {
            boards.get(code).add_player(ws);
        } else {
            const board = new ServerBoard(code);
            board.add_player(ws);
            boards.set(code, board);
        }

        ws.on('close', remove_empty);
    });
}

main();
