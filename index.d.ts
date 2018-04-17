type Validate = (text: string, pos: number, self: LinkifyIt) => number | boolean;
type Normalize = (match: Match) => void;

interface Rule {
  validate: Validate | RegExp;
  normalize?: Normalize;
}

interface Options {
  fuzzyLink?: boolean;
  fuzzyIP?: boolean;
  fuzzyEmail?: boolean;
}

interface Match {
  index: number;
  lastIndex: number;
  raw: string;
  schema: string;
  text: string;
  url: string;
}

export default class LinkifyIt {
  public add(schema: string, rule: Rule): LinkifyIt;
  public match(text: string): Match[];
  public normalize(raw: string): string;
  public pretest(text: string): boolean;
  public set(options: Options): LinkifyIt;
  public test(text: string): boolean;
  public testSchemaAt(text: string, schemaName: string, pos: number): number;
  public tlds(list: string | string[], keepOld?: boolean): LinkifyIt;
}