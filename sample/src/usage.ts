import {JsonDeserializer} from './json-deserializer';
import {LinguisticCheckResult2} from './definitions';
import * as data from '../data.json'

const result = JsonDeserializer.deserialize<LinguisticCheckResult2>(LinguisticCheckResult2, data);