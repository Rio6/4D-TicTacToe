import { Board, Dimension, Piece } from './ttt';

//const ws_url = 'ws://app.r26.me:8869';
const ws_url = 'ws://localhost:8869';

export type ClientBoardUpdate = (ClientBoard) => void;

export class ClientBoard extends Board {
    private url: string;
    private ws: WebSocket = null;
    private update: ClientBoardUpdate;

    constructor(dimension: Dimension, code: string, update?: ClientBoardUpdate) {
        super(dimension);
        this.url = ws_url + '/' + code;
        this.update = update;
        this.connect();
    }

    connect() {
        if(this.ws != null) {
            this.ws.close();
            this.ws = null;
        }

        this.ws = new WebSocket(this.url);

        this.ws.addEventListener('message', (e: MessageEvent) => this.onmessage(e));
        this.ws.addEventListener('close', () => this.reconnect());
    }

    reconnect() {
        this.ws?.close();
        this.ws = null;;
        setTimeout(() => this.connect(), 1000);
    }

    onmessage(e: MessageEvent) {
        if(e.data == '') {
            this.reset();
        } else {
            this.deserialize(e.data);
        }

        this.check_winners();

        if(this.update != null) {
            this.update(this)
        }
    }

    send(...args: any[]) {
        if(this.ws?.readyState == WebSocket.OPEN)
            this.ws.send(JSON.stringify(args));
    }

    reset(dimension: Dimension = this.dimension ?? Dimension.FOUR) {
        if(this.ws != null)
            this.send('reset', dimension);
        else
            super.reset();
    }

    put_piece() {
        this.send('put_piece', this.select);
    }
}
