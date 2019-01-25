import 'reflect-metadata';
import {isNullOrUndefined} from 'util';
import {Utils} from './utils';

/* from http://cloudmark.github.io/Json-Mapping/
 with bug fixes and extensions to support reference, parsers and polymorphism */

export interface IJsonMetaData<T> {
    clazz?: { new(): T };
    name?: string;
    parser?: (j: any) => T;
}

const jsonMetadataKey = 'jsonProperty';

export function JsonProperty<T>(metadata?: IJsonMetaData<T> | string): any {
    if (metadata instanceof String || typeof metadata === 'string') {
        return Reflect.metadata(jsonMetadataKey, {
            name: metadata,
            clazz: undefined,
            parser: undefined
        });
    } else {
        const metadataObj = metadata as IJsonMetaData<T>;
        return Reflect.metadata(jsonMetadataKey, {
            name: metadataObj ? metadataObj.name : undefined,
            clazz: metadataObj ? metadataObj.clazz : undefined,
            parser: metadataObj ? metadataObj.parser : undefined
        });
    }
}

export function getClazz(target: any, propertyKey: string): any {
    return Reflect.getMetadata('design:type', target, propertyKey);
}

export function getJsonProperty<T>(target: any, propertyKey: string): IJsonMetaData<T> {
    return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
}

const jsonPolymorphismMetadataKey = 'jsonPolymorphism';

export interface IJsonPolymorphism {
    clazz: { new(): any };
    name: string;
}

export function RegisterForPolymorphism(name: string) {
    return (target: any) => {
        let metadata = getJsonPolymorphism(target.__proto__);
        if (!metadata) {
            metadata = [];
        }
        metadata.push({name, clazz: target});
        target.__proto__ = Reflect.metadata(jsonPolymorphismMetadataKey, metadata)(target.__proto__);
        return target;
    };
}

export function getJsonPolymorphism(target: any): IJsonPolymorphism[] {
    return Reflect.getMetadata(jsonPolymorphismMetadataKey, target);
}

export class JsonDeserializer {
    static deserialize<T>(clazz: { new(): T } | undefined, jsonObject: any, knownObjects?: any): T | undefined {
        if (isNullOrUndefined(clazz) || isNullOrUndefined(jsonObject)) {
            return undefined;
        }

        if (jsonObject.$type) {
            const polymorphism = getJsonPolymorphism(clazz);
            if (polymorphism && polymorphism.filter) {
                const subclassDefinition = polymorphism.filter(x => x.name === jsonObject.$type)[0];
                if (subclassDefinition && subclassDefinition.clazz) {
                    clazz = subclassDefinition.clazz;
                }
            }
        }

        let obj = new clazz();
        if (knownObjects === undefined) {
            knownObjects = {};
        }

        if (jsonObject.$id) {
            knownObjects[jsonObject.$id] = obj;
        }

        if (jsonObject.$ref) {
            obj = knownObjects[jsonObject.$ref];
        } else {
            Object.keys(obj).sort().forEach((key) => {
                JsonDeserializer.getInnerData(key, jsonObject, obj, knownObjects);
            });
        }
        return obj;
    }

    static getInnerData<T>(key: string, jsonObject: any, obj: T, knownObjects: any) {
        const clazz = getClazz(obj, key);

        function valueFromPropertyMetadata(innerPropertyMetadata: IJsonMetaData<any>): any {
            const propertyName = innerPropertyMetadata.name || key;
            let innerJson = jsonObject[propertyName];
            if (!innerJson) {
                return undefined;
            }
            if (Utils.isArray(clazz)) {
                const metadata = getJsonProperty(obj, key);

                if (!Utils.isArray(innerJson)) {
                    const keys = Object.keys(innerJson);
                    if (keys.length === 1) {
                        innerJson = [innerJson[keys[0]]];
                    } else {
                        return undefined;
                    }
                }
                if (metadata.clazz) {
                    const metadataClazz = metadata.clazz;
                    return innerJson.map(
                        (item: any) => JsonDeserializer.deserialize(metadataClazz, item, knownObjects));
                } else if (metadata.parser) {
                    const metadataParser = metadata.parser;
                    return innerJson.map((item: any) => metadataParser(item));
                } else {
                    return innerJson;
                }
            } else if (innerPropertyMetadata.parser) {
                return innerPropertyMetadata.parser(innerJson);
            } else if (!Utils.isPrimitive(clazz)) {
                return JsonDeserializer.deserialize(clazz, innerJson, knownObjects);
            } else {
                return innerJson;
            }
        }

        const propertyMetadata = getJsonProperty(obj, key);
        if (propertyMetadata) {
            const value = valueFromPropertyMetadata(propertyMetadata);
            if (value !== undefined) {
                obj[key] = value;
            }
        } else {
            if (jsonObject && jsonObject[key] !== undefined) {
                obj[key] = jsonObject[key];
            }
        }
    }
}
