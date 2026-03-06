export type TokenFields = Record<string, unknown>;

export interface Token<
  TType extends string = string,
  TFields extends TokenFields = TokenFields,
> {
  type: TType;
  fields: TFields;
  payload?: Record<string, unknown>;
}

export interface ITokenizer<TToken extends Token = Token> {
  tokenize(line: string): TToken | null;
  flush(): TToken | null;
  reset(): void;
  isCollecting(): boolean;
}
