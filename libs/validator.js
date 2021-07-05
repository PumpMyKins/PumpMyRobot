import { Logger } from './logger.cjs';

export class Validator {
    constructor(){
        this.values = new Map();
    }

    addValue(value, type){
        if(this.values.has(value)){
            throw new ValueAlreadyHandleError(value);
        }
        this.values.set(value, type);
    }

    validate(object){
        this.values.forEach((type, value) => {
            if(!Object.prototype.hasOwnProperty.call(object, value)){
                throw new MissingValueError(value, type); // MISSING FIELD
            } else if(typeof object[value] !== type){
                throw new WrongValueTypeError(value, type); // WRONG TYPE
            }
        });
    }

    static fromObject(object){
        let validator = new Validator();
        for (let key of Object.keys(object)){
            validator.addValue(key, typeof object[key]);
        }
        return validator;
    }
}

class ValueError extends Error {
    constructor(msg, value){
        super(msg);
        this.field = value;
    }
}

export class ValueAlreadyHandleError extends ValueError {
    constructor(value){
        super("Validator already have to validate the value : " + value, value);
    }
}

class TypedValueError extends ValueError {
    constructor(msg, value, type){
        super(msg, value);
        this.type = type;
    }
}

export class MissingValueError extends TypedValueError {
    constructor(value, type){
        super("Missing value " + value + " of type " + type, value, type);
    }
}

export class WrongValueTypeError extends TypedValueError {
    constructor(value, type){
        super("It seems value " + value + " do not have right type " + type, value, type);
    }
}