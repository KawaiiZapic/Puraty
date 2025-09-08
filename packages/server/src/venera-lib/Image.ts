// jimp is too heavy for quickjs, takes up to 300 secs to process a png with 2M size
// Considering using some native command line tool like imagemagick

let CurrentImageKey = 0;

const getImageKey = () => {
    return ++CurrentImageKey;
};
export class Image {
    key = 0;

    private _w: number = 0;
    private _h: number = 0;
    private _f?: string;
    private _op: string[];

    constructor(key: number) {
        this.key = key;
        this._op = [];
    }

    copyRange(x: number, y: number, width: number, height: number): Image {
        const r = new Image(getImageKey());
        r._w = width;
        r._h = height;
        r._op = [`crop:${this.key}:${x}:${y}:${width}:${height}`];
        return r;
    }

    copyAndRotate90() {
        const r = new Image(getImageKey());
        r._w = this._h;
        r._h = this._w;
        r._op = [`rotate:${this.key}:90`];
        return r;
    }

    fillImageAt(x: number, y: number, image: Image) {
        this._op.push(`fill:${image.key}:${x}:${y}`);
    }

    fillImageRangeAt(x: number, y: number, image: Image, srcX: number, srcY: number, width: number, height: number) {
        this._op.push(`fill:${image.key}:${x}:${y}:${srcX}:${srcY}:${width}:${height}`);
    }

    get width() {
        return this._w;
    }

    get height() {
        return this._h;
    }

    get _source() {
        return this._f;
    }

    static empty(width: number, height: number) {
        const r = new Image(getImageKey());
        r._w = width;
        r._h = height;
        return r;
    }

    static fromFile(file: string) {
        const r = new Image(getImageKey());
        r._f = file;
        return r;
    }
}
