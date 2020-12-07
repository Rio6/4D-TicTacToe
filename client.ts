import { Board, Dimension, Piece } from './ttt';

const ws_url = 'ws://app.r26.me:8869';

export type ClientBoardUpdate = (ClientBoard) => void;

export class ClientBoard extends Board {
    public url: string;
    public side: Piece = null;

    private ws: WebSocket = null;
    private update: ClientBoardUpdate;
    private should_reconnect = true;

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

        this.should_reconnect = true;

        this.ws = new WebSocket(this.url);

        this.ws.addEventListener('message', (e: MessageEvent) => this.onmessage(e));
        this.ws.addEventListener('close', () => this.reconnect());
    }

    reconnect() {
        if(this.should_reconnect) {
            this.ws?.close();
            this.ws = null;;
            setTimeout(() => this.connect(), 1000);
        }
    }

    disconnect() {
        this.should_reconnect = false;
        this.ws.close();
    }

    connected() : boolean {
        return this.ws?.readyState == WebSocket.OPEN;
    }

    onmessage(e: MessageEvent) {
        const data = JSON.parse(e.data);

        switch(data[0]) {
            case 'first':
                this.reset();
                break;
            case 'side':
                this.side = data[1];
                break;
            case 'board':
                this.deserialize(data[1]);
                break;
        }

        this.check_winners();

        if(this.update != null) {
            this.update(this)
        }
    }

    send(...args: any[]) {
        if(this.connected())
            this.ws.send(JSON.stringify(args));
    }

    reset(dimension: Dimension = this.dimension ?? Dimension.FOUR) {
        if(this.ws != null)
            this.send('reset', dimension);
        else
            super.reset(dimension);
    }

    put_piece() {
        this.send('put_piece', this.select);
    }
}
