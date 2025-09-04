// to be re-implemented with jimp

export class Image {
    key = 0;

    constructor(key: number) {
        this.key = key;
    }

    copyRange(x: number, y: number, width: number, height: number): Image | null {
        throw new Error("Calling not implemented method copyRange(x: number, y: number, width: number, height: number): Image | null");
    }

    copyAndRotate90() {
        throw new Error("Calling not implemented method copyAndRotate90(): Image | null");
    }

    fillImageAt(x: number, y: number, image: Image) {
        throw new Error("Calling not implemented method fillImageAt(x: number, y: number, image: Image): Image | null");
    }

    fillImageRangeAt(x: number, y: number, image: Image, srcX: number, srcY: number, width: number, height: number) {
        throw new Error("Calling not implemented method fillImageRangeAt()");
    }

    get width() {
        throw new Error("Calling not implemented getter width()")
    }

    get height() {
        throw new Error("Calling not implemented getter height()")
    }

    static empty(width: number, height: number) {
        throw new Error("Calling not implemented method empty()")
    }
}
