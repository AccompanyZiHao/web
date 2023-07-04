

将 `token` 流转换成 `AST`，这个过程就是解析器的工作。

## 1.`createSourceFile` 函数, 用于创建源文件

这个方法它通过 `performance.mark("beforeParse");` 和 `performance.mark("afterParse");` 来进行解析前，解析后的标记，从而记录解析的时间，然后通过 `performance.measure("Parse", "beforeParse", "afterParse");` 来计算解析的时间。

```ts
export function createSourceFile(fileName: string, sourceText: string, languageVersionOrOptions: ScriptTarget | CreateSourceFileOptions, setParentNodes = false, scriptKind?: ScriptKind): SourceFile {
  tracing?.push(tracing.Phase.Parse, "createSourceFile", { path: fileName }, /*separateBeginAndEnd*/ true);
  performance.mark("beforeParse");
  // ...
  performance.mark("afterParse");
  performance.measure("Parse", "beforeParse", "afterParse");
  tracing?.pop();
  return result;
}
```

## 2. `parseSourceFile` 函数, 用于解析源文件

```ts
 export function parseSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, syntaxCursor: IncrementalParser.SyntaxCursor | undefined, setParentNodes = false, scriptKind?: ScriptKind, setExternalModuleIndicatorOverride?: (file: SourceFile) => void): SourceFile {
  // 1. 确保脚本类型 js, ts, tsx, jsx,json 等等
  scriptKind = ensureScriptKind(fileName, scriptKind);
  // 如果是 json 文件, 则调用 `parseJsonText` 函数, 用于解析 json 文件
  if (scriptKind === ScriptKind.JSON) {
    const result = parseJsonText(fileName, sourceText, languageVersion, syntaxCursor, setParentNodes);
    convertToJson(result, result.statements[0]?.expression, result.parseDiagnostics, /*returnValue*/ false, /*jsonConversionNotifier*/ undefined);
    result.referencedFiles = emptyArray;
    result.typeReferenceDirectives = emptyArray;
    result.libReferenceDirectives = emptyArray;
    result.amdDependencies = emptyArray;
    result.hasNoDefaultLib = false;
    result.pragmas = emptyMap as ReadonlyPragmaMap;
    return result;
  }
  // 2. 初始化状态
  initializeState(fileName, sourceText, languageVersion, syntaxCursor, scriptKind);
  // 3. 解析源文件
  const result = parseSourceFileWorker(languageVersion, setParentNodes, scriptKind, setExternalModuleIndicatorOverride || setExternalModuleIndicator);

  clearState();

  return result;
}
```

### 2.1  initializeState

在解析源元素之前初始化并启动扫描程序。

```ts
function initializeState(_fileName: string, _sourceText: string, _languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor | undefined, _scriptKind: ScriptKind) {
  // ...
  // Initialize and prime the scanner before parsing the source elements.
  scanner.setText(sourceText);
  scanner.setOnError(scanError);
  scanner.setScriptTarget(languageVersion);
  scanner.setLanguageVariant(languageVariant);
}
```

### 2.2 `parseSourceFileWorker` 函数, 用于解析源文件

```ts
 function parseSourceFileWorker(languageVersion: ScriptTarget, setParentNodes: boolean, scriptKind: ScriptKind, setExternalModuleIndicator: (file: SourceFile) => void): SourceFile {
  // ...
  // Prime the scanner.
  nextToken();

  // 1. 创建源文件
  const sourceFile = createSourceFile(fileName, sourceText, languageVersion, /*setParentNodes*/ true, scriptKind);
  // 2. 解析源文件
  sourceFile.statements = parseList(ParsingContext.SourceElements, parseStatement);
  // 3. 设置外部模块指示器
  setExternalModuleIndicator(sourceFile);
  // 4. 返回源文件
  return sourceFile;
}
```

#### 2.2.1 nextToken

`nextToken` 函数, 用于获取下一个 `token`，并且更新 `pos` 和 `token` 的值
如果关键字有转义字符, 则报错，否则就获取下一个 `token`

```ts
function nextToken(): SyntaxKind {
  // if the keyword had an escape
  if (isKeyword(currentToken) && (scanner.hasUnicodeEscape() || scanner.hasExtendedUnicodeEscape())) {
    // issue a parse error for the escape
    parseErrorAt(scanner.getTokenStart(), scanner.getTokenEnd(), Diagnostics.Keywords_cannot_contain_escape_characters);
  }
  return nextTokenWithoutCheck();
}

function nextTokenWithoutCheck() {
  return currentToken = scanner.scan();
}
```

#### 2.2.2 createSourceFile

`createSourceFile` 函数, 这个是 `namespace Parser` 中的函数，主要是创建一个解析的目标，`setTextRangePosWidth` 函数, 用于设置 `node` 的 `pos`。

```ts
 function createSourceFile(
  fileName: string,
  languageVersion: ScriptTarget,
  scriptKind: ScriptKind,
  isDeclarationFile: boolean,
  statements: readonly Statement[],
  endOfFileToken: EndOfFileToken,
  flags: NodeFlags,
  setExternalModuleIndicator: (sourceFile: SourceFile) => void): SourceFile {
  // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
  // this is quite rare comparing to other nodes and createNode should be as fast as possible
  let sourceFile = factory.createSourceFile(statements, endOfFileToken, flags);
  setTextRangePosWidth(sourceFile, 0, sourceText.length);
  setFields(sourceFile);

  // If we parsed this as an external module, it may contain top-level await
  if (!isDeclarationFile && isExternalModule(sourceFile) && sourceFile.transformFlags & TransformFlags.ContainsPossibleTopLevelAwait) {
    sourceFile = reparseTopLevelAwait(sourceFile);
    setFields(sourceFile);
  }

  return sourceFile;

  function setFields(sourceFile: SourceFile) {
    sourceFile.text = sourceText;
    sourceFile.bindDiagnostics = [];
    sourceFile.bindSuggestionDiagnostics = undefined;
    sourceFile.languageVersion = languageVersion;
    sourceFile.fileName = fileName;
    sourceFile.languageVariant = getLanguageVariant(scriptKind);
    sourceFile.isDeclarationFile = isDeclarationFile;
    sourceFile.scriptKind = scriptKind;

    setExternalModuleIndicator(sourceFile);
    sourceFile.setExternalModuleIndicator = setExternalModuleIndicator;
  }
}
```

#### 2.2.3 parseList

`parseList` 函数, 用于解析列表，该函数返回的

```ts
function parseList<T extends Node>(kind: ParsingContext, parseElement: () => T): NodeArray<T> {
  const saveParsingContext = parsingContext;
  parsingContext |= 1 << kind;
  const list = [];
  // 获取当前节点的起始位置
  const listPos = getNodePos();
  // 不是 SyntaxKind.EndOfFileToken 类型
  while (!isListTerminator(kind)) {
    if (isListElement(kind, /*inErrorRecovery*/ false)) {
      list.push(parseListElement(kind, parseElement));
      continue;
    }

    if (abortParsingListOrMoveToNextToken(kind)) {
      break;
    }
  }

  parsingContext = saveParsingContext;
  return createNodeArray(list, listPos);
}

```

关于 `parsingContext` 这里一个有意思的注释，这个注释是说，这个类型是一个谎言，这个值实际上包含了 `1 << ParsingContext.XYZ` 的结果，这个值是一个位运算，也是一个二进制。

它这里使用了 `var` 来声明，而不是 `let`，因为在运行时，`let` 会进行 `TDZ` 检查，这个检查是很耗时的，同时这里有一条相关的 `issue`。

```ts
// TODO(jakebailey): This type is a lie; this value actually contains the result
// of ORing a bunch of `1 << ParsingContext.XYZ`.
var parsingContext: ParsingContext;
// Why var? It avoids TDZ checks in the runtime which can be costly.
// See: https://github.com/microsoft/TypeScript/issues/52924
```

1. 获取当前节点的起始位置
2. `isListTerminator` 函数, 用于判断是否是 `SyntaxKind.EndOfFileToken` 类型（结束的类型表示）
3. `parseListElement` 主要依赖于 `parseElement` 函数，即：在 `parseSourceFileWorker` 中传入的 `parseStatement` 函数
4. 最终返回了 `createNodeArray` 函数。

```ts
function parseStatement(): Statement {
  switch (token()) {
    case SyntaxKind.SemicolonToken:
      return parseEmptyStatement();
    case SyntaxKind.OpenBraceToken:
      return parseBlock(/*ignoreMissingOpenBrace*/ false);
    case SyntaxKind.VarKeyword:
      return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
    case SyntaxKind.LetKeyword:
      if (isLetDeclaration()) {
        return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
      }
      break;
    //...
  }
}
```

以分号为例，`parseEmptyStatement` 函数, 用于解析空语句，即：`;`

`parseExpected` 函数, 用于解析 `token` 是否是 `SyntaxKind.SemicolonToken` 类型，如果是则解析下一个`token`，执行 `nextToken` ，并且返回 `true`，否则报错，这里允许传入一个 `diagnosticMessage` 的回调函数，如果没有则使用默认的报错信息，并且返回 `false`。

```ts
 function parseEmptyStatement(): Statement {
  const pos = getNodePos();
  const hasJSDoc = hasPrecedingJSDocComment();
  parseExpected(SyntaxKind.SemicolonToken);
  return withJSDoc(finishNode(factory.createEmptyStatement(), pos), hasJSDoc);
}

function parseExpected(kind: PunctuationOrKeywordSyntaxKind, diagnosticMessage?: DiagnosticMessage, shouldAdvance = true): boolean {
  if (token() === kind) {
    if (shouldAdvance) {
      nextToken();
    }
    return true;
  }

  // Report specific message if provided with one.  Otherwise, report generic fallback message.
  if (diagnosticMessage) {
    parseErrorAtCurrentToken(diagnosticMessage);
  } else {
    parseErrorAtCurrentToken(Diagnostics._0_expected, tokenToString(kind));
  }
  return false;
}
```

`finishNode` 会标记节点的结束位置。并且为其加上 `contextFlags`。 如果解析该节点前遇到错误就无法增量使用该节点，一旦标记了该节点，就清除标记，以免标记后续节点。

```ts
 function finishNode<T extends Node>(node: T, pos: number, end?: number): T {
  setTextRangePosEnd(node, pos, end ?? scanner.getTokenFullStart());
  if (contextFlags) {
    (node as Mutable<T>).flags |= contextFlags;
  }

  // Keep track on the node if we encountered an error while parsing it.  If we did, then
  // we cannot reuse the node incrementally.  Once we've marked this node, clear out the
  // flag so that we don't mark any subsequent nodes.
  if (parseErrorBeforeNextFinishedNode) {
    parseErrorBeforeNextFinishedNode = false;
    (node as Mutable<T>).flags |= NodeFlags.ThisNodeHasError;
  }

  return node;
}
```

`createNodeArray` 创建 `NodeArray`。

```ts
function createNodeArray<T extends Node>(elements: T[], pos: number, end?: number, hasTrailingComma?: boolean): NodeArray<T> {
  const array = factoryCreateNodeArray(elements, hasTrailingComma);
  setTextRangePosEnd(array, pos, end ?? scanner.getTokenFullStart());
  return array;
}
```

`setTextRangePosEnd` 函数, 用于设置节点的位置信息。

`factoryCreateNodeArray` 使用的是 `nodeFactory.ts` 中的 `createNodeArray`， 它用于创建一个 `NodeArray` 类型的数组。

```ts
// @api
function createNodeArray<T extends Node>(elements?: readonly T[], hasTrailingComma?: boolean): NodeArray<T> {
  if (elements === undefined || elements === emptyArray) {
    elements = [];
  } else if (isNodeArray(elements)) {
    if (hasTrailingComma === undefined || elements.hasTrailingComma === hasTrailingComma) {
      // Ensure the transform flags have been aggregated for this NodeArray
      if (elements.transformFlags === undefined) {
        aggregateChildrenFlags(elements as MutableNodeArray<T>);
      }
      Debug.attachNodeArrayDebugInfo(elements);
      return elements;
    }

    // This *was* a `NodeArray`, but the `hasTrailingComma` option differs. Recreate the
    // array with the same elements, text range, and transform flags but with the updated
    // value for `hasTrailingComma`
    const array = elements.slice() as MutableNodeArray<T>;
    array.pos = elements.pos;
    array.end = elements.end;
    array.hasTrailingComma = hasTrailingComma;
    array.transformFlags = elements.transformFlags;
    Debug.attachNodeArrayDebugInfo(array);
    return array;
  }

  // Since the element list of a node array is typically created by starting with an empty array and
  // repeatedly calling push(), the list may not have the optimal memory layout. We invoke slice() for
  // small arrays (1 to 4 elements) to give the VM a chance to allocate an optimal representation.
  const length = elements.length;
  const array = (length >= 1 && length <= 4 ? elements.slice() : elements) as MutableNodeArray<T>;
  array.pos = -1;
  array.end = -1;
  array.hasTrailingComma = !!hasTrailingComma;
  array.transformFlags = TransformFlags.None;
  aggregateChildrenFlags(array);
  Debug.attachNodeArrayDebugInfo(array);
  return array;
}

function aggregateChildrenFlags(children: MutableNodeArray<Node>) {
  let subtreeFlags = TransformFlags.None;
  for (const child of children) {
    subtreeFlags |= propagateChildFlags(child);
  }
  children.transformFlags = subtreeFlags;
}
```

如果传入的 `elements` 有 `hasTrailingComma` 属性，并且没有转换标志，就执行 `aggregateChildrenFlags` 函数，这个函数用于聚合子节点的转换标志。
否则，重新创建具有相同元素、文本范围和转换标志并且更新 `hasTrailingComma` 属性。

这里使用了小数组，1 - 4 个元素则使用 `slice` 函数。

`hasTrailingComma` 属性，这个属性是一个布尔值，表示是否有尾随逗号。

`aggregateChildrenFlags` 用来统计子节点的转换标志。

#### 2.2.4 setExternalModuleIndicator

```ts
function setExternalModuleIndicator(sourceFile: SourceFile) {
  sourceFile.externalModuleIndicator = isFileProbablyExternalModule(sourceFile);
}

/** @internal */
export function isFileProbablyExternalModule(sourceFile: SourceFile) {
  // Try to use the first top-level import/export when available, then
  // fall back to looking for an 'import.meta' somewhere in the tree if necessary.
  return forEach(sourceFile.statements, isAnExternalModuleIndicatorNode) ||
    getImportMetaIfNecessary(sourceFile);
}
```

为文件设置一个 `externalModuleIndicator` 属性，优先使用 `import/export`, 如果没有的话就使用 `import.meta`。

这里的 `forEach` 是内部自定以的一个循环，把 `sourceFile.statements` 的每一个元素当做参数传给 `isAnExternalModuleIndicatorNode` 并执行该函数，返回该函数的执行结果。 如果 `sourceFile.statements` 不是一个数组，就执行 `getImportMetaIfNecessary`。

```ts
function getImportMetaIfNecessary(sourceFile: SourceFile) {
  return sourceFile.flags & NodeFlags.PossiblyContainsImportMeta ?
    walkTreeForImportMeta(sourceFile) :
    undefined;
}

function walkTreeForImportMeta(node: Node): Node | undefined {
  return isImportMeta(node) ? node : forEachChild(node, walkTreeForImportMeta);
}
```

### 2.3 clearState

清除初始化的时候的一些状态。

```ts   
function clearState() {
  // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
  scanner.clearCommentDirectives();
  scanner.setText("");
  scanner.setOnError(undefined);

  // Clear any data.  We don't want to accidentally hold onto it for too long.
  sourceText = undefined!;
  languageVersion = undefined!;
  syntaxCursor = undefined;
  scriptKind = undefined!;
  languageVariant = undefined!;
  sourceFlags = 0;
  parseDiagnostics = undefined!;
  jsDocDiagnostics = undefined!;
  parsingContext = 0;
  identifiers = undefined!;
  notParenthesizedArrow = undefined;
  topLevel = true;
}
```

### 小结

解析的整体流程：

`creatSourceFile`(创建打标记) => `parseSourceFile`(解析) => `initializeState`(初始化) => `parseSourceFileWorker`(解析源文件的工作流程) => `nextToken` => `createSourceFile`(真正的创建文件，设置文本的属性) => `parseList` => `parseStatement`(根据不同的 `token` 生成不同的节点) => `parseExpected`(校验 `token` 是否匹配) => `finishNode`(设置节点的结束位置) => `clearState`(清除状态)

核心的三个步骤：

1. `createSourceFile` 设置资源的一些初始信息，并且把节点的创建内联在这个方法里面，因为这里需不要处理源文件的特殊情况。
2. `parseExpected` 会检查解析器状态中的当前 `token` 是否与指定的 `SyntaxKind` 匹配。如果不匹配，则会向传入的 `diagnosticMessage`（诊断消息）报告，未传入则创建某种通用形式 `xxx expected` 来提供错误报告。
3. `finishNode` 设置节点的结束位置，以及上下文的标志(`contextFlags`)。


![parser](https://cdn.jsdelivr.net/gh/AccompanyZiHao/images/typeScript/parser.png)
