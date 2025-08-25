import _assert from "tjs:assert";

const asyncWrapper = async (actual: unknown) => {
  if (typeof actual === "function") {
    return await actual();
  }
  return actual;
}

export default {
  async deepEqual<T>(description: string, actual: unknown, expected: T){
    return _assert.deepEqual(await asyncWrapper(actual), expected, description);
  },
  async eq<T>(description: string, actual: unknown, expected: T){
    return _assert.eq(await asyncWrapper(actual), expected, description);
  },
  async equal<T>(description: string, actual: unknown, expected: T){
    return _assert.equal(await asyncWrapper(actual), expected, description);
  },
  async equals<T>(description: string, actual: unknown, expected: T){
    return _assert.equals(await asyncWrapper(actual), expected, description);
  },
  async fail(message: string){
    return _assert.fail(message);
  },
  async falsy(description: string, actual: unknown){
    return _assert.falsy(await asyncWrapper(actual), description);
  },
  async is<T>(description: string, actual: unknown, expected: T){
    return _assert.is(await asyncWrapper(actual), expected, description);
  },
  async isNot<T>(description: string, actual: unknown, expected: T){
    return _assert.isNot(await asyncWrapper(actual), expected, description);
  },
  async notDeepEqual<T>(description: string, actual: unknown, expected: T){
    return _assert.notDeepEqual(await asyncWrapper(actual), expected, description);
  },
  async notEq<T>(description: string, actual: unknown, expected: T){
    return _assert.notEq(await asyncWrapper(actual), expected, description);
  },
  async notEqual<T>(description: string, actual: unknown, expected: T){
    return _assert.notEqual(await asyncWrapper(actual), expected, description);
  },
  async notEquals<T>(description: string, actual: unknown, expected: T){
    return _assert.notEquals(await asyncWrapper(actual), expected, description);
  },
  async notOk(description: string, actual: unknown) {
    return _assert.notOk(await asyncWrapper(actual), description);
  },
  async notSame<T>(description: string, actual: unknown, expected: T){
    return _assert.notSame(await asyncWrapper(actual), expected, description);
  },
  async ok(description: string, actual: unknown){
    return _assert.ok(await asyncWrapper(actual), description);
  },
  async same<T>(description: string, actual: unknown, expected: T){
    return _assert.same(await asyncWrapper(actual), expected, description);
  },
  async throws(description: string, fn: Function, expected: RegExp | Function){
    return _assert.throws(fn, expected, description);
  },
  async truthy<T>(description: string, actual: unknown){
    return _assert.truthy(await asyncWrapper(actual), description);
  }
};