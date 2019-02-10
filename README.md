# babel-decorators-metadata

This is an experimental babel plugin that emits decorator metadata. Based on requiremnets from [here](https://stackoverflow.com/questions/53015862/metadata-retention-with-typescript-babel-7-decorators/54360611#54360611)

Limitations:
* If no type annotation is present we have no type to write
* If we have a type reference, we can only use the type name, we can't check if the refence is to an interface, as type alias, a class or an enum. In practice this means that : 
    * If the type is an interface or a type alias, the type name will be undefined at runtime, to avoid the undefined we can do `type || Object` to default to object if the type does not have a runtime value associated
    * If the type is an enum, Typescript would write `Number` or `String` in the metadata, depending on the type of the enum. Since we write the type name to the metadata, this means you will end up with the container object of the enum inside the metadata. 

# Usage

### Install
```sh
npm install babel-plugin-decorator-metadata-typescript
```

### Sample .babelrc

```json
{
  "env": {},
  "ignore": [],
  "plugins": [
    "decorator-metadata-typescript",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    "babel-plugin-transform-es2015-modules-commonjs"
  ],
  "presets": [
    "@babel/preset-typescript"
  ]
}
```



