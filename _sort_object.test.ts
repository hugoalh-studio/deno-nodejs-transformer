import { assertEquals } from "STD/assert/equals";
import { sortObject } from "./_sort_object.ts";
const sample1 = {
	d: "0bd85eab08e1",
	b: "abdc6b784c27",
	c: "a5e0a18f58f2",
	a: "abee7ff65308"
};
Deno.test("1", { permissions: "none" }, () => {
	const result = Object.keys(sortObject(sample1));
	assertEquals(result, ["a", "b", "c", "d"]);
});
Deno.test("2", { permissions: "none" }, () => {
	const result = Object.keys(sortObject(sample1, {
		orderSpecifyKeys: ["c"]
	}));
	assertEquals(result, ["c", "a", "b", "d"]);
});
Deno.test("3", { permissions: "none" }, () => {
	const result = Object.keys(sortObject(sample1, {
		orderRestPosition: -1,
		orderSpecifyKeys: ["c"]
	}));
	assertEquals(result, ["a", "b", "d", "c"]);
});
