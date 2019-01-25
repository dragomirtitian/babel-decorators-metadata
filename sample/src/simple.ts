declare var decorator: any;

interface ISampleInterface {

}

enum Flags { One }
class OtherClass {}


type ArrayAlias = number[]

class Test {
    @decorator
    untypedProp; // no design:type
    @decorator
    nrProp: number // Number as expected
    @decorator
    strProp: string // String as expected
    @decorator
    boolProp: boolean // Boolean as expected

    @decorator
    nrPropUndefined: number | undefined // Number as expected
    @decorator
    strPropUndefined: string | undefined // String as expected
    @decorator
    boolPropUndefined: boolean | undefined // Boolean as expected

    @decorator
    arrayProp: number[]
    
    // Type references
    @decorator
    selfClassRefProp: Test; // OtherClass || Object  = Object since OtherClass is still a class at runtime
    @decorator
    classRefProp: OtherClass; // OtherClass || Object  = Object since OtherClass is still a class at runtime
    
    @decorator
    interfaceRefProp: ISampleInterface;  // ISampleInterface || Object  = Object since ISampleInterface is undefined at runtime

    @decorator
    enumRefProp: Flags; // Flags || Object = Flags since Flags exists as a value at runtime, here TS would have written Number/String

    @decorator
    typeAliasProp: ArrayAlias; // ArrayAlias || Object = Object since ArrayAlias does not exist t runtime and in Babel swe have no idea ArrayAlias is actually an array
    
}