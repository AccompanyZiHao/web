TypeScript 编译器提供了两个发射器：

1. emitter.ts：可能是你最感兴趣的发射器，它是 TS -> JavaScript 的发射器
2. declarationEmitter.ts：这个发射器用于为 TypeScript 源文件（.ts） 创建声明文件（.d.ts）

## `Program` 对发射器的使用

`Program` 提供了一个 `emit` 函数。该函数主要将功能委托给 `emitter.ts` 中的 `emitFiles` 函数。

`Program.emit` => `emitWorker`  （在 `program.ts` 中的 `createProgram` => `emitFiles` （`emitter.ts` 中的函数）

`program.ts/emitWorker `

```ts
function emitWorker(program: Program, sourceFile: SourceFile | undefined, writeFileCallback: WriteFileCallback | undefined, cancellationToken: CancellationToken | undefined, emitOnly?: boolean | EmitOnly, customTransformers?: CustomTransformers, forceDtsEmit?: boolean): EmitResult {
  if (!forceDtsEmit) {
    const result = handleNoEmitOptions(program, sourceFile, writeFileCallback, cancellationToken);
    if (result) return result;
  }

  // 在下面的“emitTime”跟踪代码之外创建发射解析器。这样，与之相关的任何成本（如类型检查）都与类型检查计数器相关联。
  // 如果指定了-out选项，则不应将源文件传递给getEmitResolver。
  // 这是因为在-out场景中，需要发出所有文件，因此需要对所有文件进行类型检查。指定所有文件都需要进行类型检查的方法是不将文件传递给getEmitReve

  const emitResolver = getTypeChecker().getEmitResolver(outFile(options) ? undefined : sourceFile, cancellationToken);

  performance.mark("beforeEmit");

  const emitResult = emitFiles(
    emitResolver,
    getEmitHost(writeFileCallback),
    sourceFile,
    getTransformers(options, customTransformers, emitOnly),
    emitOnly,
    /*onlyBuildInfo*/ false,
    forceDtsEmit
  );

  performance.mark("afterEmit");
  performance.measure("Emit", "beforeEmit", "afterEmit");
  return emitResult;
}
```

`emitWorker`（通过 `emitFiles` 参数）给发射器提供一个 `EmitResolver`。 `getTypeChecker` 就是 `checker.ts` 中的 `createTypeChecker`，它返回一个 `TypeChecker`接口的对象，里面包含了 `getEmitResolver` 函数。

### emitFiles

```ts
/** @internal */
// 当用户只希望在整个项目中发出一个文件时，targetSourceFile。这在compileOnSave特性中使用
export function emitFiles(resolver: EmitResolver, host: EmitHost, targetSourceFile: SourceFile | undefined, {
  scriptTransformers,
  declarationTransformers
}: EmitTransformers, emitOnly?: boolean | EmitOnly, onlyBuildInfo?: boolean, forceDtsEmit?: boolean): EmitResult {

  var compilerOptions = host.getCompilerOptions();
  var sourceMapDataList: SourceMapEmitResult[] | undefined = (compilerOptions.sourceMap || compilerOptions.inlineSourceMap || getAreDeclarationMapsEnabled(compilerOptions)) ? [] : undefined;
  var emittedFilesList: string[] | undefined = compilerOptions.listEmittedFiles ? [] : undefined;
  var emitterDiagnostics = createDiagnosticCollection();
  var newLine = getNewLineCharacter(compilerOptions);
  var writer = createTextWriter(newLine);
  var {
    enter,
    exit
  } = performance.createTimer("printTime", "beforePrint", "afterPrint");
  var bundleBuildInfo: BundleBuildInfo | undefined;
  var emitSkipped = false;
  /* eslint-enable no-var */

  // Emit each output file
  enter();
  forEachEmittedFile(
    host,
    emitSourceFileOrBundle,
    getSourceFilesToEmit(host, targetSourceFile, forceDtsEmit),
    forceDtsEmit,
    onlyBuildInfo,
    !targetSourceFile
  );
  exit();


  return {
    emitSkipped,
    diagnostics: emitterDiagnostics.getDiagnostics(),
    emittedFiles: emittedFilesList,
    sourceMaps: sourceMapDataList,
  };
}
```

这段代码的流程就是进入的时候通过 `enter` 函数的中的 `mark` 做个标记，发射文件，退出。核心就是 `forEachEmittedFile`

### forEachEmittedFile

遍历源文件，输出具有`emit`的源文件，如果 `sourceFilesOrTargetSourceFile` 是数组，就遍历数组，如果不是数组，就调用 `getSourceFilesToEmit` 来获取要发射的源文件列表。

```ts

export function forEachEmittedFile<T>(
  host: EmitHost, action: (emitFileNames: EmitFileNames, sourceFileOrBundle: SourceFile | Bundle | undefined) => T,
  sourceFilesOrTargetSourceFile?: readonly SourceFile[] | SourceFile,
  forceDtsEmit = false,
  onlyBuildInfo?: boolean,
  includeBuildInfo?: boolean) {
  const sourceFiles = isArray(sourceFilesOrTargetSourceFile) ? sourceFilesOrTargetSourceFile : getSourceFilesToEmit(host, sourceFilesOrTargetSourceFile, forceDtsEmit);
  const options = host.getCompilerOptions();
  if (outFile(options)) {
    const prepends = host.getPrependNodes();
    if (sourceFiles.length || prepends.length) {
      const bundle = factory.createBundle(sourceFiles, prepends);
      const result = action(getOutputPathsFor(bundle, host, forceDtsEmit), bundle);
      if (result) {
        return result;
      }
    }
  } else {
    if (!onlyBuildInfo) {
      for (const sourceFile of sourceFiles) {
        const result = action(getOutputPathsFor(sourceFile, host, forceDtsEmit), sourceFile);
        if (result) {
          return result;
        }
      }
    }
    if (includeBuildInfo) {
      const buildInfoPath = getTsBuildInfoEmitOutputFilePath(options);
      if (buildInfoPath) return action({ buildInfoPath }, /*sourceFileOrBundle*/ undefined);
    }
  }
}
```

可以看到最终都是通过 `action` 函数返回了一个 `result`, 这个 `result` 就是 `emitSourceFileOrBundle` 的返回值，也就是 `emitResult`。

### emitSourceFileOrBundle

```ts
function emitSourceFileOrBundle({
                                  jsFilePath,
                                  sourceMapFilePath,
                                  declarationFilePath,
                                  declarationMapPath,
                                  buildInfoPath
                                }: EmitFileNames, sourceFileOrBundle: SourceFile | Bundle | undefined) {

  // ...
  tracing?.push(tracing.Phase.Emit, "emitJsFileOrBundle", { jsFilePath });
  emitJsFileOrBundle(sourceFileOrBundle, jsFilePath, sourceMapFilePath, relativeToBuildInfo);
  tracing?.pop();

  tracing?.push(tracing.Phase.Emit, "emitDeclarationFileOrBundle", { declarationFilePath });
  emitDeclarationFileOrBundle(sourceFileOrBundle, declarationFilePath, declarationMapPath, relativeToBuildInfo);
  tracing?.pop();

  tracing?.push(tracing.Phase.Emit, "emitBuildInfo", { buildInfoPath });
  emitBuildInfo(bundleBuildInfo, buildInfoPath);
  tracing?.pop();

  // ...
}
```

这一段代码就是发射 `js` 文件，声明文件，以及构建信息。即：`emitJsFileOrBundle` => `emitDeclarationFileOrBundle` => `emitBuildInfo`

### emitJsFileOrBundle

```ts
function emitJsFileOrBundle(
  sourceFileOrBundle: SourceFile | Bundle | undefined,
  jsFilePath: string | undefined,
  sourceMapFilePath: string | undefined,
  relativeToBuildInfo: (path: string) => string) {
  if (!sourceFileOrBundle || emitOnly || !jsFilePath) {
    return;
  }

  // 如果无法写入js文件和源映射文件，请确保不要写入它们中的任何一个
  if (host.isEmitBlocked(jsFilePath) || compilerOptions.noEmit) {
    emitSkipped = true;
    return;
  }
  // 转换源文件
  const transform = transformNodes(resolver, host, factory, compilerOptions, [sourceFileOrBundle], scriptTransformers, /*allowDtsFiles*/ false);

  const printerOptions: PrinterOptions = {
    removeComments: compilerOptions.removeComments,
    newLine: compilerOptions.newLine,
    noEmitHelpers: compilerOptions.noEmitHelpers,
    module: compilerOptions.module,
    target: compilerOptions.target,
    sourceMap: compilerOptions.sourceMap,
    inlineSourceMap: compilerOptions.inlineSourceMap,
    inlineSources: compilerOptions.inlineSources,
    extendedDiagnostics: compilerOptions.extendedDiagnostics,
    writeBundleFileInfo: !!bundleBuildInfo,
    relativeToBuildInfo
  };

  // Create a printer to print the nodes
  const printer = createPrinter(printerOptions, {
    // resolver hooks
    hasGlobalName: resolver.hasGlobalName,

    // transform hooks
    onEmitNode: transform.emitNodeWithNotification,
    isEmitNotificationEnabled: transform.isEmitNotificationEnabled,
    substituteNode: transform.substituteNode,
  });

  Debug.assert(transform.transformed.length === 1, "Should only see one output from the transform");
  printSourceFileOrBundle(jsFilePath, sourceMapFilePath, transform, printer, compilerOptions);

  // Clean up emit nodes on parse tree
  transform.dispose();
  if (bundleBuildInfo) bundleBuildInfo.js = printer.bundleFileInfo;
}

```

发射 `js` 文件的核心就是 `printSourceFileOrBundle` 函数，它有接受一个 `printer` 的参数，这个 `printer` 是通过 `createPrinter` 创建的。

### createPrinter

```ts
export function createPrinter(printerOptions: PrinterOptions = {}, handlers: PrintHandlers = {}): Printer {
  var {
    hasGlobalName,
    onEmitNode = noEmitNotification,
    isEmitNotificationEnabled,
    substituteNode = noEmitSubstitution,
    onBeforeEmitNode,
    onAfterEmitNode,
    onBeforeEmitNodeArray,
    onAfterEmitNodeArray,
    onBeforeEmitToken,
    onAfterEmitToken
  } = handlers;
  // ...
  var emitBinaryExpression = createEmitBinaryExpression();
  /* eslint-enable no-var */

  reset();
  return {
    // public API
    printNode,
    printList,
    printFile,
    printBundle,

    // internal API
    writeNode,
    writeList,
    writeFile,
    writeBundle,
    bundleFileInfo
  };
}
```

既然是创建，它自然会生成一些`api`，这些 `api` 就是我们在`printSourceFileOrBundle`中使用的。

我们接着在看一下`var emitBinaryExpression = createEmitBinaryExpression();`

### createEmitBinaryExpression

```ts
 function createEmitBinaryExpression() {
  interface WorkArea {
    stackIndex: number;
    preserveSourceNewlinesStack: (boolean | undefined)[];
    containerPosStack: number[];
    containerEndStack: number[];
    declarationListContainerEndStack: number[];
    shouldEmitCommentsStack: boolean[];
    shouldEmitSourceMapsStack: boolean[];
  }

  return createBinaryExpressionTrampoline(onEnter, onLeft, onOperator, onRight, onExit, /*foldState*/ undefined);

  function onEnter(node: BinaryExpression, state: WorkArea | undefined) {
  }

  function onLeft(next: Expression, _workArea: WorkArea, parent: BinaryExpression) {
    return maybeEmitExpression(next, parent, "left");
  }

  function onOperator(operatorToken: BinaryOperatorToken, _state: WorkArea, node: BinaryExpression) {

  }

  function onRight(next: Expression, _workArea: WorkArea, parent: BinaryExpression) {
    return maybeEmitExpression(next, parent, "right");
  }

  function onExit(node: BinaryExpression, state: WorkArea) {

  }

  function maybeEmitExpression(next: Expression, parent: BinaryExpression, side: "left" | "right") {
    const parenthesizerRule = side === "left" ?
      parenthesizer.getParenthesizeLeftSideOfBinaryForOperator(parent.operatorToken.kind) :
      parenthesizer.getParenthesizeRightSideOfBinaryForOperator(parent.operatorToken.kind);

    let pipelinePhase = getPipelinePhase(PipelinePhase.Notification, EmitHint.Expression, next);
    if (pipelinePhase === pipelineEmitWithSubstitution) {
      Debug.assertIsDefined(lastSubstitution);
      next = parenthesizerRule(cast(lastSubstitution, isExpression));
      pipelinePhase = getNextPipelinePhase(PipelinePhase.Substitution, EmitHint.Expression, next);
      lastSubstitution = undefined;
    }

    if (pipelinePhase === pipelineEmitWithComments ||
      pipelinePhase === pipelineEmitWithSourceMaps ||
      pipelinePhase === pipelineEmitWithHint) {
      if (isBinaryExpression(next)) {
        return next;
      }
    }

    currentParenthesizerRule = parenthesizerRule;
    pipelinePhase(EmitHint.Expression, next);
  }
}
```

### createBinaryExpressionTrampoline

函数签名如下：

```ts   
/**
 * 创建一个状态机，该状态机使用堆遍历“BinaryExpression”以减少大型树上的调用堆栈深度。
 * @param onEnter 输入“BinaryExpression”时计算的回调。返回新的用户定义状态，以便在行走时与节点关联。
 * @param onLeft 在“BinaryExpression”的左侧遍历时计算的回调。返回“BinaryExpression”以继续行走，或返回“void”以前进到右侧。
 * @param onRight 在“BinaryExpression”的右侧遍历时计算的回调。返回“BinaryExpression”以继续遍历，或返回“void”以前进到节点的末尾。
 * @param onExit 退出“BinaryExpression”时计算的回调。返回的结果将被折叠到父对象的状态，或者如果位于顶部框架，则从助行器返回。
 * @param foldState 当嵌套“onExit”的结果应折叠到该节点的父节点的状态时，计算回调
 * @returns 一个函数，使用上面的回调遍历“BinaryExpression”节点，从最外层的“BinaryExpression”节点返回对“onExit”的调用结果。
 *
 * @internal
 */
export function createBinaryExpressionTrampoline<TOuterState, TState, TResult>(
  onEnter: (node: BinaryExpression, prev: TState | undefined, outerState: TOuterState) => TState,
  onLeft: ((left: Expression, userState: TState, node: BinaryExpression) => BinaryExpression | void) | undefined,
  onOperator: ((operatorToken: BinaryOperatorToken, userState: TState, node: BinaryExpression) => void) | undefined,
  onRight: ((right: Expression, userState: TState, node: BinaryExpression) => BinaryExpression | void) | undefined,
  onExit: (node: BinaryExpression, userState: TState) => TResult,
  foldState: ((userState: TState, result: TResult, side: "left" | "right") => TState) | undefined,
): (node: BinaryExpression, outerState: TOuterState) => TResult;

```

### getPipelinePhase

在创建 `emitBinaryExpression` 的时候，我们调用了 `getPipelinePhase` 函数，它的函数签名如下：

```ts
function getPipelinePhase(phase: PipelinePhase, emitHint: EmitHint, node: Node) {
  switch (phase) {
    case PipelinePhase.Notification:
      if (onEmitNode !== noEmitNotification && (!isEmitNotificationEnabled || isEmitNotificationEnabled(node))) {
        return pipelineEmitWithNotification;
      }
    // falls through
    case PipelinePhase.Substitution:
      if (substituteNode !== noEmitSubstitution && (lastSubstitution = substituteNode(emitHint, node) || node) !== node) {
        if (currentParenthesizerRule) {
          lastSubstitution = currentParenthesizerRule(lastSubstitution);
        }
        return pipelineEmitWithSubstitution;
      }
    // falls through
    case PipelinePhase.Comments:
      if (shouldEmitComments(node)) {
        return pipelineEmitWithComments;
      }
    // falls through
    case PipelinePhase.SourceMaps:
      if (shouldEmitSourceMaps(node)) {
        return pipelineEmitWithSourceMaps;
      }
    // falls through
    case PipelinePhase.Emit:
      return pipelineEmitWithHint;
    default:
      return Debug.assertNever(phase);
  }
}


```

`PipelinePhase` 是一个枚举类型，它的值如下：

```ts
const enum PipelinePhase {
  Notification,
  Substitution,
  Comments,
  SourceMaps,
  Emit,
}
```

先看 `PipelinePhase.Notification:` 这个类型，他最终返回的是 `pipelineEmitWithNotification`，这个函数的函数签名如下：

```ts

function pipelineEmitWithNotification(hint: EmitHint, node: Node) {
  const pipelinePhase = getNextPipelinePhase(PipelinePhase.Notification, hint, node);
  onEmitNode(hint, node, pipelinePhase);
}

function getNextPipelinePhase(currentPhase: PipelinePhase, emitHint: EmitHint, node: Node) {
  return getPipelinePhase(currentPhase + 1, emitHint, node);
}
```

终于看到 `onEmitNode` 这个函数了，它还记得 `createPrinter` 这个不？

```ts
export function createPrinter(printerOptions: PrinterOptions = {}, handlers: PrintHandlers = {}): Printer {
  var {
    onEmitNode = noEmitNotification,
    onBeforeEmitNode
  } = handlers;
}

export function noEmitNotification(hint: EmitHint, node: Node, callback: (hint: EmitHint, node: Node) => void) {
  callback(hint, node);
}
```

对应 `pipelineEmitWithNotification` 就是执行了一个回调函数。

我们再接着看 `getPipelinePhase`, 在匹配到 `phase` 的类型为 `PipelinePhase.Emit` 的时候，就会执行 `pipelineEmitWithHint`

### pipelineEmitWithHint

```ts
function pipelineEmitWithHint(hint: EmitHint, node: Node): void {
  onBeforeEmitNode?.(node);
  if (preserveSourceNewlines) {
    const savedPreserveSourceNewlines = preserveSourceNewlines;
    beforeEmitNode(node);
    pipelineEmitWithHintWorker(hint, node);
    afterEmitNode(savedPreserveSourceNewlines);
  } else {
    pipelineEmitWithHintWorker(hint, node);
  }
  onAfterEmitNode?.(node);
  // clear the parenthesizer rule as we ascend
  currentParenthesizerRule = undefined;
}

// 保存 preserveSourceNewlines 的值
function afterEmitNode(savedPreserveSourceNewlines: boolean | undefined) {
  preserveSourceNewlines = savedPreserveSourceNewlines;
}
```

`onBeforeEmitNode， onAfterEmitNode` 同上 `createPrinter` 是一个可选参数。

### pipelineEmitWithHintWorker

```ts
function pipelineEmitWithHintWorker(hint: EmitHint, node: Node, allowSnippets = true): void {
  if (allowSnippets) {
    const snippet = getSnippetElement(node);
    if (snippet) {
      return emitSnippetNode(hint, node, snippet);
    }
  }
  if (hint === EmitHint.SourceFile) return emitSourceFile(cast(node, isSourceFile));
  if (hint === EmitHint.IdentifierName) return emitIdentifier(cast(node, isIdentifier));
  if (hint === EmitHint.JsxAttributeValue) return emitLiteral(cast(node, isStringLiteral), /*jsxAttributeEscape*/ true);
  if (hint === EmitHint.MappedTypeParameter) return emitMappedTypeParameter(cast(node, isTypeParameterDeclaration));
  if (hint === EmitHint.EmbeddedStatement) {
    Debug.assertNode(node, isEmptyStatement);
    return emitEmptyStatement(/*isEmbeddedStatement*/ true);
  }
  if (hint === EmitHint.Unspecified) {
    switch (node.kind) {
      // Pseudo-literals
      case SyntaxKind.TemplateHead:
      case SyntaxKind.TemplateMiddle:
      case SyntaxKind.TemplateTail:
        return emitLiteral(node as LiteralExpression, /*jsxAttributeEscape*/ false);

      // ...
    }
    if (isExpression(node)) {
      hint = EmitHint.Expression;
      if (substituteNode !== noEmitSubstitution) {
        const substitute = substituteNode(hint, node) || node;
        if (substitute !== node) {
          node = substitute;
          if (currentParenthesizerRule) {
            node = currentParenthesizerRule(node);
          }
        }
      }
    }
  }
  if (hint === EmitHint.Expression) {
    switch (node.kind) {
      // Literals
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.BigIntLiteral:
        return emitNumericOrBigIntLiteral(node as NumericLiteral | BigIntLiteral);

      // ...
    }
  }
  if (isKeyword(node.kind)) return writeTokenNode(node, writeKeyword);
  if (isTokenKind(node.kind)) return writeTokenNode(node, writePunctuation);
  Debug.fail(`Unhandled SyntaxKind: ${ Debug.formatSyntaxKind(node.kind) }.`);
}
```

通过不同的 `hint` 来调用不同的函数，比如 `emitSourceFile`， `emitIdentifier` 等等。

### emitIdentifier

看个比较简单的 `emitIdentifier`。

```ts
function emitIdentifier(node: Identifier) {
  const writeText = node.symbol ? writeSymbol : write;
  writeText(getTextOfNode(node, /*includeTrivia*/ false), node.symbol);
  emitList(node, getIdentifierTypeArguments(node), ListFormat.TypeParameters); // Call emitList directly since it could be an array of TypeParameterDeclarations _or_ type arguments
}
```

这里就简单明了了，先写入，再发射。

### emitList

```ts
 function emitList<Child extends Node, Children extends NodeArray<Child>>(parentNode: Node | undefined, children: Children | undefined, format: ListFormat, parenthesizerRule?: ParenthesizerRuleOrSelector<Child>, start?: number, count?: number) {
  emitNodeList(
    emit,
    parentNode,
    children,
    format | (parentNode && getEmitFlags(parentNode) & EmitFlags.MultiLine ? ListFormat.PreferNewLine : 0),
    parenthesizerRule,
    start,
    count);
}
```

这里有个 `emit` 函数：

```ts
function emit<T extends Node>(node: T, parenthesizerRule?: (node: T) => T): void;
function emit<T extends Node>(node: T | undefined, parenthesizerRule?: (node: T) => T): void;
function emit<T extends Node>(node: T | undefined, parenthesizerRule?: (node: T) => T) {
  if (node === undefined) return;
  const prevSourceFileTextKind = recordBundleFileInternalSectionStart(node);
  pipelineEmit(EmitHint.Unspecified, node, parenthesizerRule);
  recordBundleFileInternalSectionEnd(prevSourceFileTextKind);
}

function pipelineEmit<T extends Node>(emitHint: EmitHint, node: T, parenthesizerRule?: (node: T) => T) {
  currentParenthesizerRule = parenthesizerRule;
  const pipelinePhase = getPipelinePhase(PipelinePhase.Notification, emitHint, node);
  pipelinePhase(emitHint, node);
  currentParenthesizerRule = undefined;
}
```

`getPipelinePhase` 这里又是一个递归实现

```ts
function recordBundleFileInternalSectionEnd(prevSourceFileTextKind: ReturnType<typeof recordBundleFileInternalSectionStart>) {
  if (prevSourceFileTextKind) {
    recordBundleFileTextLikeSection(writer.getTextPos());
    sourceFileTextPos = getTextPosWithWriteLine();
    sourceFileTextKind = prevSourceFileTextKind;
  }
}

function recordBundleFileTextLikeSection(end: number) {
  if (sourceFileTextPos < end) {
    updateOrPushBundleFileTextLike(sourceFileTextPos, end, sourceFileTextKind);
    return true;
  }
  return false;
}

function updateOrPushBundleFileTextLike(pos: number, end: number, kind: BundleFileTextLikeKind) {
  const last = lastOrUndefined(bundleFileInfo!.sections);
  if (last && last.kind === kind) {
    last.end = end;
  } else {
    bundleFileInfo!.sections.push({
      pos,
      end,
      kind
    });
  }
}
```

![emitter](https://cdn.jsdelivr.net/gh/AccompanyZiHao/images/typeScript/emitter.png)

