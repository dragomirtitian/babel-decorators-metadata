import {JsonProperty, RegisterForPolymorphism} from './json-deserializer';

export class PropertyBase {
    @JsonProperty({name: 'b:Name'})
    name: string = '';
}

export enum TermUsage {
    DoNotUse,
    Recommended,
    Normal,
    Undefined,
}

export class PicklistPropertyValue {
    @JsonProperty({
        name: 'b:Usage', parser: value => {
            return TermUsage[value];
        }
    }) 
    usage: TermUsage = TermUsage.Undefined;
    @JsonProperty({name: 'b:Value'})
    value: string = '';
}

@RegisterForPolymorphism('b:PicklistProperty')
export class PicklistProperty extends PropertyBase {
    @JsonProperty({name: 'b:Values', clazz: PicklistPropertyValue})
    values: Array<PicklistPropertyValue> = [];
}

@RegisterForPolymorphism('b:TextProperty')
export class TextProperty extends PropertyBase {
    @JsonProperty({name: 'b:Values'})
    values: Array<string> = [];
}

export class TermBase {
    @JsonProperty({name: 'b:Id', parser: v => parseInt(v, 10)})
    id: number | undefined = undefined;
    @JsonProperty({name: 'b:Properties', clazz: PropertyBase})
    properties: Array<PropertyBase> = [];
    @JsonProperty({name: 'b:Term'})
    term: string = '';
}

export class Synonym extends TermBase {

}

export class Definition {
    @JsonProperty({name: 'b:Lcid', parser: v => parseInt(v, 10)})
    lcid: number | undefined = undefined;
    @JsonProperty({name: 'b:Note'})
    note: string = '';
    @JsonProperty({name: 'b:Text'})
    text: string = '';
}

export class Concept {
    @JsonProperty({name: 'b:ConceptId', parser: v => parseInt(v, 10)})
    conceptId: number | undefined = undefined;
    @JsonProperty({name: 'b:Definitions', clazz: Definition})
    definitions: Array<Definition> = [];
    @JsonProperty({name: 'b:Properties', clazz: PropertyBase})
    properties: Array<PropertyBase> = [];
    @JsonProperty({name: 'b:Synonyms', clazz: Synonym})
    synonyms: Array<Synonym> = [];
}

export class Term extends TermBase {
    @JsonProperty({name: 'b:Concept'})
    concept: Concept = new Concept();
}

export class TermInfo {
    @JsonProperty({name: 'b:Term'})
    term: Term = new Term();
}

export class ErrorDescription {
    @JsonProperty({name: 'a:Explanation'})
    explanation: string = '';
    @JsonProperty({name: 'a:Header'})
    header: string = '';
    @JsonProperty({name: 'a:Instruction'})
    instruction: string = '';
}

export enum ExplanationPartType {
    Text,
    Explanation,
    Undefined
}

export class ExplanationPart {
    @JsonProperty({name: 'a:Text'})
    text: string = '';
    @JsonProperty({
        name: 'a:Type', parser: value => {
            return ExplanationPartType[value];
        }
    })
    type: ExplanationPartType = ExplanationPartType.Undefined;
}

export class ErrorDetailedDescription {
    @JsonProperty({name: 'a:Code'})
    code: string = '';
    @JsonProperty({name: 'a:Description'})
    description: ErrorDescription = new ErrorDescription();
    @JsonProperty({name: 'a:Explanation', clazz: ExplanationPart})
    explanation: Array<ExplanationPart> = [];
    @JsonProperty({name: 'a:ExplanationRewrite', clazz: ExplanationPart})
    explanationRewrite: Array<ExplanationPart> = [];
}

export class Proposal {
    @JsonProperty({name: 'a:AdditionalInfo'})
    additionalInfo: string = '';
    @JsonProperty({name: 'a:BaseTermForm'})
    baseTermForm: string = '';
    @JsonProperty({name: 'a:Text'})
    text: string = '';
}

export enum LinguisticErrorType {
    Abbreviation,
    Grammar,
    Spelling,
    Style,
    Terminology,
    ValidTerm,
    Undefined
}

export class ErrorInfo {
    @JsonProperty({name: 'a:Descriptions', clazz: ErrorDetailedDescription})
    descriptions: Array<ErrorDetailedDescription> = [];
    @JsonProperty({name: 'a:Id', parser: v => parseInt(v, 10)})
    id: number | undefined = undefined;
    @JsonProperty({name: 'a:Proposals', clazz: Proposal})
    proposals: Array<Proposal> = [];
    @JsonProperty({name: 'a:RelatedTerms', clazz: TermInfo})
    relatedTerms: Array<TermInfo> = [];
    @JsonProperty({
        name: 'a:Type', parser: value => {
            return LinguisticErrorType[value];
        }
    })
    type: LinguisticErrorType = LinguisticErrorType.Undefined;

    get typeName(): string | undefined {
        return LinguisticErrorType[this.type];
    }
}

export class LinguisticReporting {
    @JsonProperty({name: 'a:AcceptableReleaseLevel', parser: v => parseInt(v, 10)})
    acceptableReleaseLevel: number = 0;
    @JsonProperty({name: 'a:AcceptableReleaseLevelTitle'})
    acceptableReleaseLevelTitle: string = '';
    @JsonProperty({name: 'a:RelativeReleaseLevel', parser: v => parseInt(v, 10)})
    relativeReleaseLevel: number = 0;
    @JsonProperty({name: 'a:ReleaseLevel', parser: v => parseInt(v, 10)})
    releaseLevel: number = 0;
    @JsonProperty({name: 'a:SafeReleaseLevel', parser: v => parseInt(v, 10)})
    safeReleaseLevel: number = 0;
    @JsonProperty({name: 'a:SafeReleaseLevelTitle'})
    safeReleaseLevelTitle: string = '';
    @JsonProperty({name: 'a:TotalCheckedWords', parser: v => parseInt(v, 10)})
    totalCheckedWords: number = 0;
    @JsonProperty({name: 'a:UnsafeReleaseLevel', parser: v => parseInt(v, 10)})
    unsafeReleaseLevel: number = 0;
    @JsonProperty({name: 'a:UnsafeReleaseLevelTitle'})
    unsafeReleaseLevelTitle: string = '';
}

export class LinguisticCheckResult2 {
    @JsonProperty({clazz: ErrorInfo, name: 'a:Errors'})
    errors: Array<ErrorInfo> = [];
    @JsonProperty({clazz: LinguisticReporting, name: 'a:Reporting'})
    reporting: LinguisticReporting = new LinguisticReporting();
    @JsonProperty({name: 'a:ResultXml'})
    resultXml: string = '';
}

export class Options {
    @JsonProperty({name: 'q5:IncludeReporting'})
    includeReporting: boolean = false;

    constructor(includeReporting: boolean) {
        this.includeReporting = includeReporting;
    }
}