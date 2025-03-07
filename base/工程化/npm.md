---
title: npm 的一些用法
author: 白菜
date: '2022-04-27'
categories:
  - 'npm'
tags:
  - npm
---

## 升级

```sh
npm install -g npm
npm install -g npm@版本号
```

## 切换淘宝源

```sh
npm install -g cnpm --registry=http://registry.npm.taobao.org
https://registry.npmjs.com
```

## 查看全局安装包

```sh
npm list -g --depth=0
```

npm adduser/ npm login

npm version patch

npm publish

登录失败 403
切换 源 `npm config set registry https://registry.npmjs.org/`
切换 源 `npm config set registry http://registry.npm.taobao.org/`

## npm cache

`npm cache `是 `npm` 用于存储下载的包和相关数据的本地缓存。它的主要作用是加速包的安装过程，减少网络请求次数。

1. 缓存作用

    `npm cache `存储了已下载的包文件， 当再次安装相同版本的包时， 可以直接从缓存中获取， 提升安装速度。

2. 缓存管理 

    有效管理 `npm cache `可以避免缓存损坏、节省磁盘空间，并确保安装的包是最新的。

3. 查看缓存位置 `npm config get cache`

4. 清理缓存 `npm cache clean-force`

5. 验证缓存
    
    可以使用以下命令验证缓存的完整性，确保缓存中的包没有损坏:    `npm cache verify`

6. 缓存策略
    - 定期清理: 定期清理缓存可以释放磁盘空间，避免缓存过多导致的性能问题
    - 使用离线缓存: 在没有网络连接时，可以使用缓存中的包进行安装，确保开发环境的稳定性。
    - 缓存目录迁移: 可以通过修改 `npm` 配置，将缓存目录迁移到其他磁盘或位置，优化磁盘使用。

7. 缓存问题解决
    - 缓存损坏:当遇到缓存损坏导致的安装问题时，可以通过清理缓存解决
    - 版本不一致:当安装的包版本与预期不符时，可以清理缓存后重新安装
    - 磁盘空间不足:通过定期清理缓存或迁移缓存目录，解决磁盘空间不足的问题

## npm 发包流程

1. 准备 `package`: 确保项目中包含必要的文件和配置，如 `package.json`、`README.md`、`LICENSE` 等。
2. 注册 `npm` 账号: 在 `npm` 官网注册一个账号，并在本地通过命令行登录。
3. 配置 `package.json`: 在 `package.json` 中设置必要的字段，如 `name`、`version`、`description`、`main` 等。
4. 发布 `package`: 使用 `npm` 命令将 `package` 发布到 `npm` 注册表。
 
### 1. 准备 package

1. 创建项目目录，并初始化 `npm`:
    ```shell
    mkdir my-package
    cd my-package
    npm init
    ```
2. 编写代码， 并确保入口文件与 `package.json` 中的 `main` 字段一致。
3. 添加 `README.md` 和 `LICENSE`文件，提供 `package` 的使用说明和授权信息,

### 2.注册和登录 npm

1. 在 `npm` 官网注册账号:https://www.npmjs.com/signup
2. 在命令行中登录 `npm:npm login`

### 3. 配置 `package.json`

确保 `package.json` 中包含以下字段：

```json
{
    "name": "my-package",
    "version": "1.0.0",
    "description": "A brief description of my package",
    "main": "index.js",
    "keywords": ["npm", "package"],
    "author": "Your Name",
    "license": "MIT"
}
```

### 4. 发布 package

1. 确保版本号正确:每次发布前，更新 `version` 字段。
2. 发布 `package`：`npm publish`

### 5. 版本管理

1. 更新版本号:根据语义化版本(`semver`)规则更新版本号。
2. 使用 `npm version` 命令自动更新版本号和 `package.json`:

```shell
npm version patch # 更新补丁版本
npm version minor # 更新次版本
npm version major # 更新主版本
```
### 6. 注意事项

1. 确保 `package` 名称唯一: 在 `npm` 上不能与已有的 `package` 名称重复。
2. 检查敏感信息: 发布前检查代码中是否包含敏感信息，如 `API` 密钥。
3. 遵循语义化版本: 根据功能变化合理更新版本号。

## npm install 的流程

1. 解析依赖关系: `npm install` 首先会解析依赖关系，根据 `package.json` 中的 `dependencies` 和 `devDependencies` 字段，确定项目所需的所有包及其版本。
2. 下载依赖：从 `npm` 仓库下载这些包，并将它们存储在项目的 `node_modules` 目录中。每个包及其子依赖都会被下载到相应的目录结构中。
3. 生成锁定文件：如果项目中没有 `package-lock.json` 或 `npm-shrinkwrap.json` 文件，`npm install` 会生成一个 `package-lock.json` 文件来记录确切的安装版本，确保不同环境中依赖的一致性。如果已存在，则使用该文件来保证依赖版本的一致性。
4. 构建依赖树：创建和维护 `node_modules` 目录中的依赖树结构，以确保所有依赖项都被正确地解析和安装。
5. 运行生命周期脚本：如果有定义特定生命周期脚本（如 `preinstall`、`install`、`postinstall` 等），会在适当的时候运行这些脚本。
6. 处理可选依赖：如果 `optionalDependencies` 中有依赖项无法安装（例如，某些平台不支持的原生模块），npm 会继续其他依赖项的安装过程，并标记这些可选依赖项为失败。
7. 缓存管理：使用本地缓存来加速依赖项的下载。已经下载过的包会从缓存中取出，而不是重新从远程仓库下载。

## pnpm install 和 npm install 的区别

### 1. 依赖存储方式

npm: 将每个依赖包完整地复制到 `node_modules` 目录中, 这意味着如果你有多个项目，它们共享相同的依赖库，这些依赖库的多个副本将在你的文件系统中的每个项目内分别存储。这可能导致大量的重复依赖，占用较多磁盘空间。依赖树结构较为复杂，可能会有深层次的嵌套。

pnpm: 使用内容寻址存储（`content-addressable storage`），将所有依赖包存储在一个全局存储目录中。通过硬链接或软链接的方式将这些包链接到项目的 `.pnpm-store` 目录中，从而节省磁盘空间。依赖树结构更加扁平化，减少了嵌套层级，使得 `node_modules` 目录更加简洁高效。

### 2. 性能与速度

npm: 由于每个依赖包都完整地复制到 `node_modules` 目录中，所以安装速度相对较慢。

pnpm: 由于使用了全局存储和链接机制，安装速度通常更快。减少了重复下载和复制的操作，提高了安装效率度更快。

### 3. 依赖平面结构 vs. 嵌套结构

npm：自版本 3 以后，默认创建扁平的 `node_modules` 结构（尽可能），这样做是为了避免 `Windows` 系统中路径过长的问题。但在必要时， npm 仍然会创建嵌套的 `node_modules` 目录结构，以解决依赖冲突。

pnpm：通过使用符号链接，`pnpm` 维护了一个严格的嵌套依赖结构，更接近每个包的 `package.json` 文件所声明的依赖树形态。这提供了更高的一致性和在某些情况下更好的包隔离性。

### 4. 依赖隔离与安全性

npm：虽然 `npm` 也遵循 `package.json` 中的声明，但其扁平化的 `node_modules` 结构有时可能会容易地让包访问到未明确声明的依赖。

pnpm：更好地隔离了依赖，每个包只能访问其在 `package.json` 中声明的依赖。这一特性增强了项目的安全性，因为它阻止了未声明的依赖被意外引入的情况。

### 硬链接 vs 软链接

硬链接（`Hard Link`）

1. 定义：硬链接是指向同一个文件系统上的同一个 `inode`（索引节点）的多个目录项。`inode` 包含了文件的数据块指针、访问权限、所有者等信息。

2. 特点：
   - 数据共享，硬链接与原始文件共享相同的 `inode`，因此它们指向的是同一个文件数据。
   - 删除一个硬链接不会影响其他硬链接或原始文件，只有当所有的硬链接和原始文件都被删除后，文件数据才会被实际删除。
   - 硬链接不能跨文件系统，只能在同一文件系统内创建。
   - 不能对目录创建硬链接（某些文件系统例外，如 `Linux` 的 `ext4`）。

3. 使用场景：适用于需要创建文件的多个副本，但不希望占用额外磁盘空间的情况。

软链接（`Symbolic Link`）

1. 定义：软链接是一个特殊的文件，它包含了一个指向另一个文件或目录的路径。软链接类似于`Windows`中的快捷方式。
2. 特点：
   - 软链接与原始文件有不同的 `inode`，它只是一个指向目标文件或目录的路径。
   - 删除软链接不会影响目标文件，但删除目标文件会使软链接失效（变成“悬空链接”）。
   - 软链接可以跨文件系统，也可以指向不存在的文件或目录。
   - 可以对目录创建软链接。
3. 使用场景：适用于需要创建文件或目录的引用，但不想复制实际文件内容的情况。例如，用于创建文件系统的快捷方式或模拟文件系统的结构。



