import {expect, test} from "vitest";
import {comparePrimitives, pList, pString} from "../src/model/primitive/primitive";

test("string primitives equal", () => {
    expect(comparePrimitives(pString("test"), pString("test"))).toBeTruthy()
})

test("string primitives inequal", () => {
    expect(comparePrimitives(pString("test"), pString("not the same"))).toBeFalsy()
})

test("list primitives equal", () => {
    expect(comparePrimitives(pList([pString("test")]), pList([pString("test")]))).toBeTruthy()
})

test("list primitives inequal", () => {
    expect(comparePrimitives(pList([pString("test")]), pList([pString("ok")]))).toBeFalsy()
})

test("list primitives wrong order inequal", () => {
    expect(comparePrimitives(pList([pString("test"), pString("test2")]),
        pList([pString("test2"), pString("test")]))).toBeFalsy()
})
