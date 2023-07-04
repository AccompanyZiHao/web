
绑定器的主要作用是创建符号 `Symbol` 把节点和符号关联起来，这样就可以通过节点找到符号，也可以通过符号找到节点。

## 1. bindSourceFile

```ts
/** @internal */
export function bindSourceFile(file: SourceFile, options: CompilerOptions) {
  performance.mark("beforeBind");
  perfLogger?.logStartBindFile("" + file.fileName);
  binder(file, options);
  perfLogger?.logStopBindFile();
  performance.mark("afterBind");
  performance.measure("Bind", "beforeBind", "afterBind");
}
```

先看 `bindSourceFile` 函数，这一幕是不是有点熟悉？ `ts` 在每次的解析和绑定之前会通过 `performance.mark` 标记一下当前的操作。

`binder` 函数来自哪里呢？

```ts
const binder = /* @__PURE__ */ createBinder();
```

## 2. createBinder

`createBinder` 返回的是一个 `bindSourceFile` 函数。

### bindSourceFile

```ts
function createBinder(): (file: SourceFile, options: CompilerOptions) => void {
  return bindSourceFile;

  function bindSourceFile(f: SourceFile, opts: CompilerOptions) {
    file = f;
    options = opts;
    languageVersion = getEmitScriptTarget(options);
    inStrictMode = bindInStrictMode(file, opts);
    classifiableNames = new Set();
    symbolCount = 0;

    Symbol = objectAllocator.getSymbolConstructor();

    // ...
    if (!file.locals) {
      tracing?.push(tracing.Phase.Bind, "bindSourceFile", { path: file.path }, /*separateBeginAndEnd*/ true);
      bind(file);
      tracing?.pop();
      file.symbolCount = symbolCount;
      file.classifiableNames = classifiableNames;
      delayedBindJSDocTypedefTag();
    }
    file = undefined!;
    options = undefined!;
    languageVersion = undefined!;
    parent = undefined!;
    container = undefined!;
    // ...
  }
}
```

`bindSourceFile` 函数的是用来检查 `file.locals` 是否被定义了，如果没有定义那就交给 `bind` 这个函数来处理。

### bind

接着来看 `bind` 函数。

```ts
 function bind(node: Node | undefined): void {
  if (!node) {
    return;
  }
  setParent(node, parent);
  if (tracing) (node as TracingNode).tracingPath = file.path;
  const saveInStrictMode = inStrictMode;

  bindWorker(node);

  if (node.kind > SyntaxKind.LastToken) {
    const saveParent = parent;
    parent = node;
    const containerFlags = getContainerFlags(node);
    if (containerFlags === ContainerFlags.None) {
      bindChildren(node);
    } else {
      bindContainer(node as HasContainerFlags, containerFlags);
    }
    parent = saveParent;
  } else {
    const saveParent = parent;
    if (node.kind === SyntaxKind.EndOfFileToken) parent = node;
    bindJSDoc(node);
    parent = saveParent;
  }
  inStrictMode = saveInStrictMode;
}
```
1. `setParent` 为当前 `node` 添加一个 `parent` 属性
2. `bindWorker` 根据不同节点调用不同的绑定函数
3. `bindChildren` 对当前的节点的子节点进行绑定

### bindWorker

```ts
function bindWorker(node: Node) {
  switch (node.kind) {
    /* Strict mode checks */
    case SyntaxKind.Identifier:
      if (node.flags & NodeFlags.IdentifierIsInJSDocNamespace) {
        let parentNode = node.parent;
        while (parentNode && !isJSDocTypeAlias(parentNode)) {
          parentNode = parentNode.parent;
        }
        bindBlockScopedDeclaration(parentNode as Declaration, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes);
        break;
      }
    // ...
  }
}
```

`bindWorker` 函数根据`node.kind`调用不同的绑定函数，比如 `Identifier` 节点会调用 `bindBlockScopedDeclaration` 函数，
对于带有名称空间的`typedef`类型名称，需要在这里绑定新的`jsdoc`类型符号，因为它要求所有包含的命名空间都有效，即当前的 `blockScopeContainer` 需要设置为其直接的命名空间父级。

#### bindBlockScopedDeclaration

```ts
function bindBlockScopedDeclaration(node: Declaration, symbolFlags: SymbolFlags, symbolExcludes: SymbolFlags) {
  switch (blockScopeContainer.kind) {
    case SyntaxKind.ModuleDeclaration:
      declareModuleMember(node, symbolFlags, symbolExcludes);
      break;
    case SyntaxKind.SourceFile:
      if (isExternalOrCommonJsModule(container as SourceFile)) {
        declareModuleMember(node, symbolFlags, symbolExcludes);
        break;
      }
    // falls through
    default:
      Debug.assertNode(blockScopeContainer, canHaveLocals);
      if (!blockScopeContainer.locals) {
        blockScopeContainer.locals = createSymbolTable();
        addToContainerChain(blockScopeContainer);
      }
      declareSymbol(blockScopeContainer.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
  }
}
```
不仅仅 `bindBlockScopedDeclaration`最后调用了 `declareSymbol` 函数， `declareModuleMember` 最后也调用了该函数。

#### declareSymbol

```ts
 function declareSymbol(symbolTable: SymbolTable, parent: Symbol | undefined, node: Declaration, includes: SymbolFlags, excludes: SymbolFlags, isReplaceableByMethod?: boolean, isComputedName?: boolean): Symbol {
  Debug.assert(isComputedName || !hasDynamicName(node));

  const isDefaultExport = hasSyntacticModifier(node, ModifierFlags.Default) || isExportSpecifier(node) && node.name.escapedText === "default";

  // 导出默认函数/类节点的导出符号始终命名为“default”
  const name = isComputedName ? InternalSymbolName.Computed
    : isDefaultExport && parent ? InternalSymbolName.Default
      : getDeclarationName(node);

  let symbol: Symbol | undefined;
  if (name === undefined) {
    symbol = createSymbol(SymbolFlags.None, InternalSymbolName.Missing);
  } else {
    symbol = symbolTable.get(name);
    // 导出默认函数/类节点的导出符号始终命名为“default”/检查符号表中是否已有具有此名称的符号。如果没有，请使用此名称创建一个新符号并将其添加到表中。请注意，我们还没有给新符号任何标志。这样可以确保它不会与我们传入的“排除”标志相冲突。

    //如果我们得到了一个现有的符号，看看它是否与我们正在创建的新符号冲突。例如，“var”符号和“class”符号将在同一符号表中发生冲突。如果我们有冲突，请报告我们为此符号所做的每个声明中的问题，然后为此创建一个新符号

    //请注意，当在Javascript构造函数中声明的属性（由isReplaceableByMethod标记）与另一个符号冲突时，该属性将丢失。总是这允许使用相同类型的绑定实例方法覆盖原型方法的常见Javascript模式：`This.method=This.method.bind（This）`

    //如果我们创建了一个新符号，或者是因为符号表中没有具有此名称的符号，或者与现有符号冲突，那么只需添加此节点作为新符号的唯一声明。

    //否则，我们将合并到一个兼容的现有符号中（例如，当您在同一容器中有多个具有相同名称的“vars”时）。在这种情况下，只需将此节点添加到符号的声明列表中即可。
    
    // ...
  }
  addDeclarationToSymbol(symbol, node, includes);
  if (symbol.parent) {
    Debug.assert(symbol.parent === parent, "Existing symbol parent should match new one");
  }
  else {
    symbol.parent = parent;
  }

  return symbol;
}
```

这个方法里面主要做了两件事情：
1. 创建一个 `symbol`，即： `symbol = createSymbol(SymbolFlags.None, InternalSymbolName.Missing);`
2. 将 `symbol` 添加到 `symbolTable` 中，即： `addDeclarationToSymbol(symbol, node, includes);`

#### createSymbol
```ts
function createSymbol(flags: SymbolFlags, name: __String): Symbol {
  symbolCount++;
  return new Symbol(flags, name);
}
```
1. 更新本地的 `symbolCount`
2. 返回一个新的 `Symbol` 对象，这个对象使用制定的参数 `flags` 创建符号，当然这个 `Symbol` 是它自己封装的，

`Symbol` 通过 `objectAllocator.getSymbolConstructor()`来获取。在 `utilities.ts` 中可以找到。

```ts
function Symbol(this: Symbol, flags: SymbolFlags, name: __String) {
  this.flags = flags;
  this.escapedName = name;
  this.declarations = undefined;
  this.valueDeclaration = undefined;
  this.id = 0;
  this.mergeId = 0;
  this.parent = undefined;
  this.members = undefined;
  this.exports = undefined;
  this.exportSymbol = undefined;
  this.constEnumOnlyModule = undefined;
  this.isReferenced = undefined;
  this.isAssigned = undefined;
  (this as any).links = undefined; // used by TransientSymbol
}
```

#### addDeclarationToSymbol

```ts
 function addDeclarationToSymbol(symbol: Symbol, node: Declaration, symbolFlags: SymbolFlags) {
  symbol.flags |= symbolFlags;
  node.symbol = symbol;
  symbol.declarations = appendIfUnique(symbol.declarations, node);

   // ...
}
```
1. 建立 `symbol` 和 `node` 的关联关系，即： `node.symbol = symbol;`
2. 为 `node` 添加 `declaration`，即： `symbol.declarations = appendIfUnique(symbol.declarations, node);`

#### containerFlags

`bindWorker` 走完了，我们再来看下 `bind` 函数中的 `getContainerFlags` 函数：它用来获取一个容器的标志。它有几个因素决定`ContainerFlags`、`node.kind` 等。。。

```ts
function getContainerFlags(node: Node): ContainerFlags {
  switch (node.kind) {
    case SyntaxKind.ClassExpression:
    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.EnumDeclaration:
    case SyntaxKind.ObjectLiteralExpression:
    case SyntaxKind.TypeLiteral:
    case SyntaxKind.JSDocTypeLiteral:
    case SyntaxKind.JsxAttributes:
      return ContainerFlags.IsContainer;
    // ...
  }
  return ContainerFlags.None;
}
```

还记得  `bind` 函数中的 `containerFlages` 的使用吗？容器标志是 `
ContainerFlags.None` 类型的走 `bindChildren`，否则走 `bindContainer`。可以理解为，如果当前节点是一个容器，那么就把它当做当前块的容器，否则给它绑定一个容器。

```ts
const containerFlags = getContainerFlags(node);
if (containerFlags === ContainerFlags.None) {
  bindChildren(node);
} else {
  bindContainer(node as HasContainerFlags, containerFlags);
}
```

#### bindEachChild
```ts
 function bindChildren(node: Node): void {
  const saveInAssignmentPattern = inAssignmentPattern;
  // Most nodes aren't valid in an assignment pattern, so we clear the value here
  // and set it before we descend into nodes that could actually be part of an assignment pattern.
  inAssignmentPattern = false;
  if (checkUnreachable(node)) {
    bindEachChild(node);
    bindJSDoc(node);
    inAssignmentPattern = saveInAssignmentPattern;
    return;
  }
  if (node.kind >= SyntaxKind.FirstStatement && node.kind <= SyntaxKind.LastStatement && !options.allowUnreachableCode) {
    (node as HasFlowNode).flowNode = currentFlow;
  }
  switch (node.kind) {
    case SyntaxKind.WhileStatement:
      bindWhileStatement(node as WhileStatement);
      break;
    case SyntaxKind.DoStatement:
      bindDoStatement(node as DoStatement);
      break;
    // ...
    default:
      bindEachChild(node);
      break;
  }
  bindJSDoc(node);
  inAssignmentPattern = saveInAssignmentPattern;
}

function bindEachChild(node: Node) {
  forEachChild(node, bind, bindEach);
}
```

`bindChildren` 函数中，我们可以看到，它会根据不同的 `node.kind` 类型绑定不同的 `bindxxxx` 函数，这些这些函数最终都会调用 `bind` 函数，这样就形成了一个递归的调用。

在 `bindContainer` 中，所有容器节点都按声明顺序保存在链接列表中。类型检查器中的 `getLocalNameOfContainer` 函数会使用该链表对容器使用的本地名称的唯一性做验证。

```ts
function bindContainer(node: Mutable<HasContainerFlags>, containerFlags: ContainerFlags) {
  // 在递归到子节点之前，我们先要保存父节点，容器和块容器。处理完弹出的子节点后，再将这些值存回原处
  const saveContainer = container;
  const saveThisParentContainer = thisParentContainer;
  const savedBlockScopeContainer = blockScopeContainer;
  // 根据节点的类型，对当前的容器和块容器进行调整
  // 如果当前节点是个容器，则自动将其视为当前的块容器。
  
  // 此外，对于我们知道可能包含局部变量的容器，我们提前初始化 .locals 字段。 我们这样做是因为很可能需要 .locals 来放置一些子项（例如，参数或变量声明）。
  
  // 但是，我们不会主动为块容器创建 .locals，因为对于块容器来说，块容器中永远不会有块范围的变量是完全正常和常见的。 我们不想最终为我们遇到的每个“块”分配一个对象，而其中大多数都不是必需的。
  
  // 最后，如果这是一个块容器，那么我们清除其中可能包含的任何现有的.locals对象。
  // 这种情况发生在增量场景中。因为我们可以重用以前编译的节点，所以该节点可能已经为其创建了“locals”。
  // 我们必须清除这一点，这样我们就不会意外地从以前的编译中向前移动任何过时的数据。
  
  if (containerFlags & ContainerFlags.IsContainer) {
    if (node.kind !== SyntaxKind.ArrowFunction) {
      thisParentContainer = container;
    }
    container = blockScopeContainer = node as IsContainer;
    if (containerFlags & ContainerFlags.HasLocals) {
      (container as HasLocals).locals = createSymbolTable();
      addToContainerChain(container as HasLocals);
    }
  }
  else if (containerFlags & ContainerFlags.IsBlockScopedContainer) {
    blockScopeContainer = node as IsBlockScopedContainer;
    if (containerFlags & ContainerFlags.HasLocals) {
      (blockScopeContainer as HasLocals).locals = undefined;
    }
  }
  if (containerFlags & ContainerFlags.IsControlFlowContainer) {
    //  我们为IIFE和构造函数创建了一个返回控制流图。对于构造函数，我们在严格的属性初始化检查中使用返回控制流图。
    // 重置节点上所有与可达性检查相关的标志（用于增量方案）
    // ...
  }
  else if (containerFlags & ContainerFlags.IsInterface) {
    seenThisKeyword = false;
    bindChildren(node);
    // ContainsThis不能与标识符上的HasExtendedUnicodeEscape重叠
    Debug.assertNotNode(node, isIdentifier);
    node.flags = seenThisKeyword ? node.flags | NodeFlags.ContainsThis : node.flags & ~NodeFlags.ContainsThis;
  }
  else {
    bindChildren(node);
  }

  container = saveContainer;
  thisParentContainer = saveThisParentContainer;
  blockScopeContainer = savedBlockScopeContainer;
}
```

### 小结：

`bindSoourceFile` => `createBinder` => `bindSourceFile` => `bind` =>`bindWorker` => `bindChildren`(为子节点创建符号) => `createSymbol` => `addDeclarationToSymbol`


![binder](https://cdn.jsdelivr.net/gh/AccompanyZiHao/images/typeScript/binder.png)