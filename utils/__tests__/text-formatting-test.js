import { capitalizeFirstLetter } from "../text-formatting";

describe('capitalizeFirstLetter function', () => {
    it('should turn a string with only lowercase letters into a string with its first letter capitalized', ()=>{
        expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should return the same string as the input if the input contains only uppercase letters', ()=>{
        expect(capitalizeFirstLetter('HELLO')).toBe('HELLO');
    });

    it('should return the same string as the input if the input already has its first letter capitalized', ()=>{
        expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
});