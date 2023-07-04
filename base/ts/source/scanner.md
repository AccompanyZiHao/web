
## scanner

1. 创建 `createScanner` 函数, 用于创建扫描器。
2. 调用 `scan` 函数, 用于扫描代码，返回的是 `SyntaxKind` 类型的值。 扫描的时候通过 `const ch = text.charCodeAt(pos);`， 获取字符的 `Unicode` 编码。
3. 根据编码来获取每个字符对应的 `token` 类型。

```ts
function scan(): SyntaxKind {
  fullStartPos = pos;
  tokenFlags = TokenFlags.None;
  let asteriskSeen = false;
  while (true) {
    tokenStart = pos;
    if (pos >= end) {
      return token = SyntaxKind.EndOfFileToken;
    }

    const ch = codePointAt(text, pos);
    if (pos === 0) {
      // If a file wasn't valid text at all, it will usually be apparent at
      // position 0 because UTF-8 decode will fail and produce U+FFFD.
      // If that happens, just issue one error and refuse to try to scan further;
      // this is likely a binary file that cannot be parsed
      if (ch === CharacterCodes.replacementCharacter) {
        // Jump to the end of the file and fail.
        error(Diagnostics.File_appears_to_be_binary);
        pos = end;
        return token = SyntaxKind.NonTextFileMarkerTrivia;
      }
      // Special handling for shebang
      if (ch === CharacterCodes.hash && isShebangTrivia(text, pos)) {
        pos = scanShebangTrivia(text, pos);
        if (skipTrivia) {
          continue;
        } else {
          return token = SyntaxKind.ShebangTrivia;
        }
      }
    }

    switch (ch) {
      case CharacterCodes.lineFeed:
      case CharacterCodes.carriageReturn:
        tokenFlags |= TokenFlags.PrecedingLineBreak;
        if (skipTrivia) {
          pos++;
          continue;
        } else {
          if (ch === CharacterCodes.carriageReturn && pos + 1 < end && text.charCodeAt(pos + 1) === CharacterCodes.lineFeed) {
            // consume both CR and LF
            pos += 2;
          } else {
            pos++;
          }
          return token = SyntaxKind.NewLineTrivia;
        }
      case CharacterCodes.tab:
      case CharacterCodes.verticalTab:
      case CharacterCodes.formFeed:
      case CharacterCodes.space:
      case CharacterCodes.nonBreakingSpace:
      // ...
    }
  }
}
```

这里对第一个做了字符做了处理，如果一个文件文本不是有效文本，通常在位置0会很明显，因为`UTF-8`解码会失败并产生`U+FFFD`。如果发生这种情况，只需发出一个错误并拒绝进一步扫描，这可能是一个无法解析的二进制文件。

扫描器通过对输入的代码进行词法分析，将代码分割成一个个的 `token`，并且给每个 `token` 赋予一个 `SyntaxKind` 类型的值，这个值就是 `token` 的类型。