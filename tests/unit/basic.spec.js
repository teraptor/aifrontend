"use strict";
describe('Базовые тесты', () => {
    it('должен корректно складывать числа', () => {
        expect(1 + 2).toBe(3);
    });
    it('должен корректно проверять равенство строк', () => {
        expect('hello').toEqual('hello');
    });
    it('должен корректно проверять наличие в массиве', () => {
        expect([1, 2, 3]).toContain(2);
    });
});
