## 与绑定器的关系

绑定器被检查器在内部调用，简化的调用栈如下所示：

```ts
program.getTypeChecker
=>
ts.createTypeChecke
=>
initializeTypeChecke => bindSourceFile => mergeSymbolTable
```

SourceFile 是绑定器的工作单元，binder.ts 由 checker.ts 驱动。

### initializeTypeChecker

在检查器中，`initializeTypeChecker` 函数负责初始化类型检查器。它的主要工作是为每个源文件创建一个绑定器 `bindSourceFile`，并将其与源文件相关联。然后，它通过 `mergeSymbolTable` 将每个源文件的符号表合并到一个全局符号表中。

```ts
  function initializeTypeChecker() {
  // Bind all source files and propagate errors
  for (const file of host.getSourceFiles()) {
    bindSourceFile(file, compilerOptions);
  }

  amalgamatedDuplicates = new Map();
  // Initialize global symbol table
  let augmentations: (readonly (StringLiteral | Identifier)[])[] | undefined;

  for (const file of host.getSourceFiles()) {
    if (file.redirectInfo) {
      continue;
    }
    if (!isExternalOrCommonJsModule(file)) {
      // 非外部模块(即脚本)声明自己的' globalThis '是错误的。
      // 我们不能使用' builtinGlobals '，因为在JS文件中会生成合成的扩展命名空间。
      const fileGlobalThisSymbol = file.locals!.get("globalThis" as __String);
      if (fileGlobalThisSymbol?.declarations) {
        for (const declaration of fileGlobalThisSymbol.declarations) {
          diagnostics.add(createDiagnosticForNode(declaration, Diagnostics.Declaration_name_conflicts_with_built_in_global_identifier_0, "globalThis"));
        }
      }
      mergeSymbolTable(globals, file.locals!);
    }
    if (file.jsGlobalAugmentations) {
      mergeSymbolTable(globals, file.jsGlobalAugmentations);
    }
    if (file.patternAmbientModules && file.patternAmbientModules.length) {
      patternAmbientModules = concatenate(patternAmbientModules, file.patternAmbientModules);
    }
    if (file.moduleAugmentations.length) {
      (augmentations || (augmentations = [])).push(file.moduleAugmentations);
    }
    if (file.symbol && file.symbol.globalExports) {
      // Merge in UMD exports with first-in-wins semantics (see #9771)
      const source = file.symbol.globalExports;
      source.forEach((sourceSymbol, id) => {
        if (!globals.has(id)) {
          globals.set(id, sourceSymbol);
        }
      });
    }
  }
}
```

### mergeSymbolTable

```ts
function mergeSymbolTable(target: SymbolTable, source: SymbolTable, unidirectional = false) {
  source.forEach((sourceSymbol, id) => {
    const targetSymbol = target.get(id);
    target.set(id, targetSymbol ? mergeSymbol(targetSymbol, sourceSymbol, unidirectional) : getMergedSymbol(sourceSymbol));
  });
}
```

这个 `target` 就是 `globals`，来自 `createTypeChecker` 中 `var globals = createSymbolTable();` 返回的是一个 `SymbolTable` 类型的 `Map`。

```ts
export type SymbolTable = Map<__String, Symbol>;
```

如果有这个 `id`，就直接 `mergeSymbol` 进去，否则，就调用 `getMergedSymbol` 函数。

#### mergeSymbol

```ts

// 注意：如果 target 是暂时(transient)的，那么它是可变的，并且 mergeSymbol 会带着他们的变异返回它。
// 如果 target 不是暂时(transient)的，mergeSymbol将生成一个临时的克隆对象，对其进行变异并返回。

function mergeSymbol(target: Symbol, source: Symbol, unidirectional = false): Symbol {
  if (!(target.flags & getExcludedSymbolFlags(source.flags)) ||
    (source.flags | target.flags) & SymbolFlags.Assignment) {
    if (source === target) {
      // This can happen when an export assigned namespace exports something also erroneously exported at the top level
      // See `declarationFileNoCrashOnExtraExportModifier` for an example
      return target;
    }
    if (!(target.flags & SymbolFlags.Transient)) {
      const resolvedTarget = resolveSymbol(target);
      if (resolvedTarget === unknownSymbol) {
        return source;
      }
      target = cloneSymbol(resolvedTarget);
    }
    // Javascript static-property-assignment declarations always merge, even though they are also values
    if (source.flags & SymbolFlags.ValueModule && target.flags & SymbolFlags.ValueModule && target.constEnumOnlyModule && !source.constEnumOnlyModule) {
      // reset flag when merging instantiated module into value module that has only const enums
      target.constEnumOnlyModule = false;
    }
    target.flags |= source.flags;
    if (source.valueDeclaration) {
      setValueDeclaration(target, source.valueDeclaration);
    }
    addRange(target.declarations, source.declarations);
    if (source.members) {
      if (!target.members) target.members = createSymbolTable();
      mergeSymbolTable(target.members, source.members, unidirectional);
    }
    if (source.exports) {
      if (!target.exports) target.exports = createSymbolTable();
      mergeSymbolTable(target.exports, source.exports, unidirectional);
    }
    if (!unidirectional) {
      recordMergedSymbol(target, source);
    }
  } else if (target.flags & SymbolFlags.NamespaceModule) {
    // 将`var globalThis`与内置`globalThis`合并时不要报告错误，因为我们已经报告了“声明名称冲突…”错误，而此错误没有多大意义。
    if (target !== globalThisSymbol) {
      error(
        source.declarations && getNameOfDeclaration(source.declarations[0]),
        Diagnostics.Cannot_augment_module_0_with_value_exports_because_it_resolves_to_a_non_module_entity,
        symbolToString(target));
    }
  } else {
    // error
    // ...
    // 将顶级重复标识符错误收集到一个映射中，这样，如果有一堆错误，我们就可以合并它们的诊断
    if (sourceSymbolFile && targetSymbolFile && amalgamatedDuplicates && !isEitherEnum && sourceSymbolFile !== targetSymbolFile) {
      const firstFile = comparePaths(sourceSymbolFile.path, targetSymbolFile.path) === Comparison.LessThan ? sourceSymbolFile : targetSymbolFile;
      const secondFile = firstFile === sourceSymbolFile ? targetSymbolFile : sourceSymbolFile;
      const filesDuplicates = getOrUpdate(amalgamatedDuplicates, `${ firstFile.path }|${ secondFile.path }`, (): DuplicateInfoForFiles =>
        ({
          firstFile,
          secondFile,
          conflictingSymbols: new Map()
        }));
      const conflictingSymbolInfo = getOrUpdate(filesDuplicates.conflictingSymbols, symbolName, (): DuplicateInfoForSymbol =>
        ({
          isBlockScoped: isEitherBlockScoped,
          firstFileLocations: [],
          secondFileLocations: []
        }));
      if (!isSourcePlainJs) addDuplicateLocations(conflictingSymbolInfo.firstFileLocations, source);
      if (!isTargetPlainJs) addDuplicateLocations(conflictingSymbolInfo.secondFileLocations, target);
    } else {
      if (!isSourcePlainJs) addDuplicateDeclarationErrorsForSymbols(source, message, symbolName, target);
      if (!isTargetPlainJs) addDuplicateDeclarationErrorsForSymbols(target, message, symbolName, source);
    }
  }
  return target;
}
```

`addRange(target.declarations, source.declarations);` 把 `source.declarations` 合并到 `target.declarations` 中。

如果 `source` 有 `members` 和 `exports` 就递归调用 `mergeSymbolTable`

`recordMergedSymbol` 记录合并的符号。

```ts
 function recordMergedSymbol(target: Symbol, source: Symbol) {
  if (!source.mergeId) {
    source.mergeId = nextMergeId;
    nextMergeId++;
  }
  mergedSymbols[source.mergeId] = target;
}
```

`addDuplicateDeclarationErrorsForSymbols`

```ts
function addDuplicateDeclarationErrorsForSymbols(target: Symbol, message: DiagnosticMessage, symbolName: string, source: Symbol) {
  forEach(target.declarations, node => {
    addDuplicateDeclarationError(node, message, symbolName, source.declarations);
  });
}

function addDuplicateDeclarationError(node: Declaration, message: DiagnosticMessage, symbolName: string, relatedNodes: readonly Declaration[] | undefined) {
  // ...
  for (const relatedNode of relatedNodes || emptyArray) {
    const adjustedNode = (getExpandoInitializer(relatedNode, /*isPrototypeAssignment*/ false) ? getNameOfExpando(relatedNode) : getNameOfDeclaration(relatedNode)) || relatedNode;
    if (adjustedNode === errorNode) continue;
    err.relatedInformation = err.relatedInformation || [];
    const leadingMessage = createDiagnosticForNode(adjustedNode, Diagnostics._0_was_also_declared_here, symbolName);
    const followOnMessage = createDiagnosticForNode(adjustedNode, Diagnostics.and_here);
    if (length(err.relatedInformation) >= 5 || some(err.relatedInformation, r => compareDiagnostics(r, followOnMessage) === Comparison.EqualTo || compareDiagnostics(r, leadingMessage) === Comparison.EqualTo)) continue;
    addRelatedInfo(err, !length(err.relatedInformation) ? leadingMessage : followOnMessage);
  }
}

```

通过这个 `addDuplicateDeclarationErrorsForSymbols` 最终能找到 `createFileDiagnostic` 这个方法。

```ts
/** @internal */
export function createFileDiagnostic(file: SourceFile, start: number, length: number, message: DiagnosticMessage, ...args: DiagnosticArguments): DiagnosticWithLocation;
/** @internal */
export function createFileDiagnostic(file: SourceFile, start: number, length: number, message: DiagnosticMessage): DiagnosticWithLocation {
  assertDiagnosticLocation(file, start, length);

  let text = getLocaleSpecificMessage(message);

  if (arguments.length > 4) {
    text = formatStringFromArgs(text, arguments, 4);
  }

  return {
    file,
    start,
    length,

    messageText: text,
    category: message.category,
    code: message.code,
    reportsUnnecessary: message.reportsUnnecessary,
    reportsDeprecated: message.reportsDeprecated
  };
}
```

#### getMergedSymbol

```ts
function getMergedSymbol(symbol: Symbol): Symbol;
function getMergedSymbol(symbol: Symbol | undefined): Symbol | undefined;
function getMergedSymbol(symbol: Symbol | undefined): Symbol | undefined {
  let merged: Symbol;
  return symbol && symbol.mergeId && (merged = mergedSymbols[symbol.mergeId]) ? merged : symbol;
}
```

## 与发射器的关系

真正的类型检查会在调用 `getDiagnostics` 时才发生。该函数被调用时（比如由 `Program.emit` 请求），检查器返回一个 `EmitResolver`（由程序调用检查器的 `getEmitResolver` 函数得到），`EmitResolver` 是 `createTypeChecker` 的一个本地函数的集合。

```ts
program.emit
=>
emitWorker => createTypeChecker.getEmitResolver
=>
getDiagnostics => getDiagnosticsWorker => checkSourceFile
```

### getDiagnostics

```ts
function getDiagnostics(sourceFile: SourceFile, ct: CancellationToken): Diagnostic[] {
  try {
    // 记录取消令牌，以便稍后在checkSourceElement期间对其进行检查。
    // 在finally块中执行此操作，这样我们就可以确保它在这个调用完成了。
    cancellationToken = ct;
    return getDiagnosticsWorker(sourceFile);
  } finally {
    cancellationToken = undefined;
  }
}
```

### getDiagnosticsWorker

```ts
function getDiagnosticsWorker(sourceFile: SourceFile): Diagnostic[] {
  if (sourceFile) {
    // ...
    checkSourceFileWithEagerDiagnostics(sourceFile);

    const semanticDiagnostics = diagnostics.getDiagnostics(sourceFile.fileName);
    // ...

    return semanticDiagnostics;
  }

  // 当没有向getDiagnostics提供文件时，添加全局诊断
  forEach(host.getSourceFiles(), checkSourceFileWithEagerDiagnostics);
  return diagnostics.getDiagnostics();
}
```

### checkSourceFileWithEagerDiagnostics

先通过 `ensurePendingDiagnosticWorkComplete` 清除积压的诊断，然后调用 `checkSourceFile`

```ts
 function checkSourceFileWithEagerDiagnostics(sourceFile: SourceFile) {
  ensurePendingDiagnosticWorkComplete();
  const oldAddLazyDiagnostics = addLazyDiagnostic;
  addLazyDiagnostic = cb => cb();
  checkSourceFile(sourceFile);
  addLazyDiagnostic = oldAddLazyDiagnostics;
}
```

### checkSourceFile

检查文件之前先做标记。

```ts
function checkSourceFile(node: SourceFile) {
  tracing?.push(tracing.Phase.Check, "checkSourceFile", { path: node.path }, /*separateBeginAndEnd*/ true);
  performance.mark("beforeCheck");
  (node);
  performance.mark("afterCheck");
  performance.measure("Check", "beforeCheck", "afterCheck");
  tracing?.pop();
}
```

### checkSourceFileWorker

检查文件，并且收集相关信息

```ts
function checkSourceFileWorker(node: SourceFile) {
  // ...
  // Grammar checking
  checkGrammarSourceFile(node);

  clear(potentialThisCollisions);
  clear(potentialNewTargetCollisions);
  clear(potentialWeakMapSetCollisions);
  clear(potentialReflectCollisions);
  clear(potentialUnusedRenamedBindingElementsInTypes);

  forEach(node.statements, checkSourceElement);
  checkSourceElement(node.endOfFileToken);

  checkDeferredNodes(node);

}
```

### checkGrammarSourceFile

选一个方法来看看。

```ts
function checkGrammarSourceFile(node: SourceFile): boolean {
  return !!(node.flags & NodeFlags.Ambient) && checkGrammarTopLevelElementsForRequiredDeclareModifier(node);
}
```

### grammarErrorOnFirstToken

最终呢，都会走到这个`grammarErrorOnFirstToken`方法。

```ts
function grammarErrorOnFirstToken(node: Node, message: DiagnosticMessage, ...args: DiagnosticArguments): boolean {
  const sourceFile = getSourceFileOfNode(node);
  if (!hasParseDiagnostics(sourceFile)) {
    const span = getSpanOfTokenAtPosition(sourceFile, node.pos);
    diagnostics.add(createFileDiagnostic(sourceFile, span.start, span.length, message, ...args));
    return true;
  }
  return false;
}
```   

### createFileDiagnostic

```ts
/** @internal */
export function createFileDiagnostic(file: SourceFile, start: number, length: number, message: DiagnosticMessage, ...args: DiagnosticArguments): DiagnosticWithLocation;
/** @internal */
export function createFileDiagnostic(file: SourceFile, start: number, length: number, message: DiagnosticMessage): DiagnosticWithLocation {
  assertDiagnosticLocation(file, start, length);

  let text = getLocaleSpecificMessage(message);

  if (arguments.length > 4) {
    text = formatStringFromArgs(text, arguments, 4);
  }

  return {
    file,
    start,
    length,

    messageText: text,
    category: message.category,
    code: message.code,
    reportsUnnecessary: message.reportsUnnecessary,
    reportsDeprecated: message.reportsDeprecated
  };
}
```

## 小结

初始化流程：

`initializeTypeChecker` => `mergeSymboyTable` => `mergeSymbol` => `getMergedSymbol`

检查流程:

`getDiagnostics` => `getDiagnosticsWorker` => `checkSourceFile` => `checkSourceFileWorker` => `checkGrammarSourceFile` =>`grammarErrorOnFirstToken` =>  `createFileDiagnostic`

`checkSourceFileWorker`: 里面还有很多类型检查：

1. checkGrammarSourceFile
2. checkSourceElement
3. checkDeferredNodes
4. addLazyDiagnostic
5. ....

![checker](https://cdn.jsdelivr.net/gh/AccompanyZiHao/images/typeScript/checker.png)
