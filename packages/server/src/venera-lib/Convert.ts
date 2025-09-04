
import CryptoJS from "crypto-js";

const _toWordArr = (buf: ArrayBuffer): CryptoJS.lib.WordArray => {
  return CryptoJS.lib.WordArray.create(buf);
}

const be2le = (v: number) => ((v & 0xFF) << 24) | ((v & 0xFF00) << 8) | ((v >> 8) & 0xFF00) | ((v >> 24) & 0xFF);

const _toArrBuf = (wordArr: CryptoJS.lib.WordArray, sliceToLen = false): ArrayBuffer => {
  // Crypto.js uses big-endian internally, convert to little-endian is required
  // Sometime we need slice array for correct result in some function
  const r= new Int32Array(wordArr.words.map(be2le)).buffer;
  return sliceToLen ? r.slice(0, wordArr.sigBytes) : r;
}
export const Convert = {
  encodeUtf8: (str: string): ArrayBuffer => {
    return new TextEncoder().encode(str).buffer;
  },
  decodeUtf8: (value: ArrayBuffer) => {
    return new TextDecoder().decode(value);
  },
  encodeGbk(str: string): ArrayBuffer {
    throw new Error("Calling not implemented function encodeGbk(str: string)");
  },
  decodeGbk(str: ArrayBuffer): string {
    throw new Error("Calling not implemented function decodeGbk(str: string)");
  },
  encodeBase64: (value: ArrayBuffer): string => {
    return CryptoJS.enc.Base64.stringify(_toWordArr(value));
  },
  decodeBase64: (value: string): ArrayBuffer => {
    return _toArrBuf(CryptoJS.enc.Base64.parse(value), true);
  },
  md5: (value: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(CryptoJS.MD5(_toWordArr(value)));
  },
  sha1: (value: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(CryptoJS.SHA1(_toWordArr(value)));
  },
  sha256: (value: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(CryptoJS.SHA256(_toWordArr(value)));
  },
  sha512: (value: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(CryptoJS.SHA512(_toWordArr(value)));
  },
  _hmac: (key: ArrayBuffer, value: ArrayBuffer, hash: string): CryptoJS.lib.WordArray => {
    const MethodMap: Record<string, "HmacMD5" | "HmacSHA1" | "HmacSHA256" | "HmacSHA512"> = {
      md5: "HmacMD5",
      sha1: "HmacSHA1",
      sha256: "HmacSHA256",
      sha512: "HmacSHA512"
    };

    if (!(hash in MethodMap)) throw new Error("Unknown hash method " + hash);
    return CryptoJS[MethodMap[hash]](_toWordArr(value), _toWordArr(key));
  },
  hmac: (key: ArrayBuffer, value: ArrayBuffer, hash: string): ArrayBuffer => {
    return _toArrBuf(Convert._hmac(key, value, hash));
  },
  hmacString: (key: ArrayBuffer, value: ArrayBuffer, hash: string): string => {
    return CryptoJS.enc.Hex.stringify(Convert._hmac(key, value, hash));
  },
  decryptAesEcb: (value: ArrayBuffer, key: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(
      CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.stringify(_toWordArr(value)), 
        _toWordArr(key), 
        { mode: CryptoJS.mode.ECB }
      )
    );
  },
  decryptAesCbc: (value: ArrayBuffer, key: ArrayBuffer, iv: ArrayBuffer): ArrayBuffer => {
    return _toArrBuf(
      CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.stringify(_toWordArr(value)), 
        _toWordArr(key), 
        { mode: CryptoJS.mode.CBC, iv: _toWordArr(iv) }
      )
    );
  },
  decryptAesCfb: (value: ArrayBuffer, key: ArrayBuffer, blockSize: number): ArrayBuffer => {
    throw new Error("AES-CFB required IV to work which Venera doesn't implement correctly, this method should not be called.");
    return _toArrBuf(
      CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.stringify(_toWordArr(value)), 
        _toWordArr(key), 
        { mode: CryptoJS.mode.CFB, blockSize }
      )
    );
  },
  decryptAesOfb: (value: ArrayBuffer, key: ArrayBuffer, blockSize: number): ArrayBuffer => {
    throw new Error("AES-OFB required IV to work which Venera doesn't implement correctly, this method should not be called.");
    return _toArrBuf(
      CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.stringify(_toWordArr(value)), 
        _toWordArr(key), 
        { mode: CryptoJS.mode.OFB, blockSize }
      )
    );
  },
  decryptRsa: (value: ArrayBuffer, key: ArrayBuffer): ArrayBuffer => {
    throw new Error("Calling not implemented function decryptRsa: (value: ArrayBuffer, key: ArrayBuffer): ArrayBuffer")
  },
  hexEncode: (bytes: ArrayBuffer): string => {
    return CryptoJS.enc.Hex.stringify(_toWordArr(bytes));
  }
}

export {};