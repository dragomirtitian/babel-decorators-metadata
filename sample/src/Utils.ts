export class Utils {
    static isArray(object: any) {
        return object &&
               (object instanceof Array || object === Array || object.constructor === Array || Array.isArray(object));
    }

    static isPrimitive(obj: any) {
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true;
        }
        return (obj instanceof String || obj === String ||
                obj instanceof Number || obj === Number ||
                obj instanceof Boolean || obj === Boolean);
    }
}