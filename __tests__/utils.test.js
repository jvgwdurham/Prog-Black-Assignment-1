/**
 * @jest-environment jsdom
 */

const tests = require("../client/js/utils.js");

test("Testing calcMaxPosts, calcs max posts for given window size", () =>
{
    expect(tests.calcMaxPosts(true)).toBe(7)
});

test("Testing cookie setting and cookie getting", () =>
{
    tests.setCookie("c_username","test",1);
    expect(tests.getCookie("c_username")).toBe("test");
});
