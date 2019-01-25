import { declare } from "@babel/helper-plugin-utils";
import syntaxTypeScript from "@babel/plugin-syntax-typescript";
import { types as t, PluginObj } from "@babel/core";
import { decorator, TSType, unaryExpression, memberExpression } from "@babel/types";


const PARSED_PARAMS = new WeakSet();
declare module '@babel/core' {
  export function assertVersion(api: number);
}
export default declare((api: typeof import('@babel/core'), { jsxPragma = "React" }): PluginObj => {
  api.assertVersion(7);

  return {
    name: "transform-typescript-decorator-metadata",
    inherits: syntaxTypeScript,

    visitor: {
      ClassDeclaration(path) {
        var node = path.node;
        for (const field of node.body.body) {
          if (field.type !== "ClassProperty") continue;

          if (field.typeAnnotation && field.typeAnnotation.type === "TSTypeAnnotation" && field.decorators.length > 0) {
            const key = field.key as t.Identifier;
            const serializedType = serializeTypeNode(field.typeAnnotation.typeAnnotation);
            field.decorators.push(decorator(
              t.callExpression(
                t.memberExpression(t.identifier("Reflect"), t.identifier("metadata")), [
                  t.stringLiteral("design:type"),
                  t.logicalExpression("||", serializedType, createIdentifier("Object"))
                ])
            ))
          }
        }
      },
    }
  };
});
type SerializedTypeNode = t.Identifier | t.UnaryExpression;
function createIdentifier(o: string) {
  return  t.identifier(o);
}

function createVoidZero() {
  return unaryExpression("void", t.numericLiteral(0));
}
function isIdentifier(o: SerializedTypeNode) :o is t.Identifier {
  return o.type === "Identifier";
}

enum SyntaxKind {
  AnyKeyword = "TSAnyKeyword",
  UnknownKeyword = "TSUnknownKeyword",
  ObjectKeyword = "TSObjectKeyword",
  NumberKeyword = "TSNumberKeyword",
  BooleanKeyword = "TSBooleanKeyword",
  StringKeyword = "TSStringKeyword",
  SymbolKeyword = "TSSymbolKeyword",
  VoidKeyword = "TSVoidKeyword",
  UndefinedKeyword ="TSUndefinedKeyword",
  NullKeyword = "TSNullKeyword",
  NeverKeyword = "TSNeverKeyword",
  ThisType = "TSThisType",
  FunctionType = "TSFunctionType",
  ConstructorType = "TSConstructorType",
  TypeReference = "TSTypeReference",
  TypePredicate = "TSTypePredicate",
  TypeQuery = "TSTypeQuery",
  TypeLiteral = "TSTypeLiteral",
  ArrayType = "TSArrayType",
  TupleType = "TSTupleType",
  OptionalType = "TSOptionalType",
  RestType = "TSRestType",
  UnionType = "TSUnionType",
  IntersectionType = "TSIntersectionType",
  ConditionalType = "TSConditionalType",
  InferType = "TSInferType",
  ParenthesizedType = "TSParenthesizedType",
  TypeOperator = "TSTypeOperator",
  IndexedAccessType = "TSIndexedAccessType",
  MappedType = "TSMappedType",
  LiteralType = "TSLiteralType",
  ExpressionWithTypeArguments = "TSExpressionWithTypeArguments",
  PrefixUnaryExpression = "NumericLiteral",
  NumericLiteral = "NumericLiteral",
  StringLiteral = "StringLiteral",
  TrueKeyword = "BooleanLiteral",
  FalseKeyword = "BooleanLiteral"
  //ImportType = "TSImportType"
}
type LiteralTypeNode = t.TSLiteralType
type TypeReferenceNode = t.TSTypeReference;
type UnionOrIntersectionTypeNode = t.TSUnionType | t.TSIntersectionType;
type ConditionalTypeNode = t.TSConditionalType;
type ParenthesizedTypeNode = t.TSParenthesizedType;
type TypeNode = t.TSType;

function serializeTypeNode(node: TypeNode | undefined): SerializedTypeNode {
  if (node === undefined) {
    return createIdentifier("Object");
  }

  switch (node.type) {
    case SyntaxKind.VoidKeyword:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.NeverKeyword:
      return createVoidZero();

    case SyntaxKind.ParenthesizedType:
      return serializeTypeNode((<ParenthesizedTypeNode>node).typeAnnotation);

    case SyntaxKind.FunctionType:
    case SyntaxKind.ConstructorType:
      return createIdentifier("Function");

    case SyntaxKind.ArrayType:
    case SyntaxKind.TupleType:
      return createIdentifier("Array");

    case SyntaxKind.TypePredicate:
    case SyntaxKind.BooleanKeyword:
      return createIdentifier("Boolean");

    case SyntaxKind.StringKeyword:
      return createIdentifier("String");

    case SyntaxKind.ObjectKeyword:
      return createIdentifier("Object");

    case SyntaxKind.LiteralType:
      switch ((<LiteralTypeNode>node).literal.type) {
        case SyntaxKind.StringLiteral:
          return createIdentifier("String");

        case SyntaxKind.PrefixUnaryExpression:
        case SyntaxKind.NumericLiteral:
          return createIdentifier("Number");

        // case SyntaxKind.BigIntLiteral:
        //   return getGlobalBigIntNameWithFallback();

        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return createIdentifier("Boolean");

        default:
          throw new Error("Bad type for decorator" + ((<LiteralTypeNode>node).literal));
      }

    case SyntaxKind.NumberKeyword:
      return createIdentifier("Number");

    // case SyntaxKind.BigIntKeyword:
    //   return getGlobalBigIntNameWithFallback();

    case SyntaxKind.SymbolKeyword:
      return createIdentifier("Symbol");

    case SyntaxKind.TypeReference:
      return serializeTypeReferenceNode(<TypeReferenceNode>node);

    case SyntaxKind.IntersectionType:
    case SyntaxKind.UnionType:
      return serializeTypeList((<UnionOrIntersectionTypeNode>node).types);

    case SyntaxKind.ConditionalType:
      return serializeTypeList([(<ConditionalTypeNode>node).trueType, (<ConditionalTypeNode>node).falseType]);

    case SyntaxKind.TypeQuery:
    case SyntaxKind.TypeOperator:
    case SyntaxKind.IndexedAccessType:
    case SyntaxKind.MappedType:
    case SyntaxKind.TypeLiteral:
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.UnknownKeyword:
    case SyntaxKind.ThisType:
    //case SyntaxKind.ImportType:
      break;


    default:
      throw new Error("Bad type for decorator");
  }

  return createIdentifier("Object");
}

function serializeTypeList(types: ReadonlyArray<TypeNode>): SerializedTypeNode {
  // Note when updating logic here also update getEntityNameForDecoratorMetadata
  // so that aliases can be marked as referenced
  let serializedUnion: SerializedTypeNode, undefined;
  for (let typeNode of types) {
    while (typeNode.type === SyntaxKind.ParenthesizedType) {
      typeNode = (typeNode as ParenthesizedTypeNode).typeAnnotation; // Skip parens if need be
    }
    if (typeNode.type === SyntaxKind.NeverKeyword) {
      continue; // Always elide `never` from the union/intersection if possible
    }
    if (typeNode.type === SyntaxKind.NullKeyword || typeNode.type === SyntaxKind.UndefinedKeyword) {
      continue; // Elide null and undefined from unions for metadata, just like what we did prior to the implementation of strict null checks
    }
    const serializedIndividual = serializeTypeNode(typeNode);

    if (isIdentifier(serializedIndividual) && serializedIndividual.name === "Object") {
      // One of the individual is global object, return immediately
      return serializedIndividual;
    }
    // If there exists union that is not void 0 expression, check if the the common type is identifier.
    // anything more complex and we will just default to Object
    else if (serializedUnion) {
      // Different types
      if (!isIdentifier(serializedUnion) ||
        !isIdentifier(serializedIndividual) ||
        serializedUnion.name !== serializedIndividual.name) {
        return createIdentifier("Object");
      }
    }
    else {
      // Initialize the union type
      serializedUnion = serializedIndividual;
    }
  }

  // If we were able to find common type, use it
  return serializedUnion || createVoidZero(); // Fallback is only hit if all union constituients are null/undefined/never
}


function serializeTypeReferenceNode(node: TypeReferenceNode) {
  function entityNameToIdentifier(t: t.TSEntityName) {
    if(t.type === "Identifier"){
      return createIdentifier(t.name);
    } else {
      return memberExpression(entityNameToIdentifier(t.left), t.right);
    }
  }
  return entityNameToIdentifier(node.typeName);
}
