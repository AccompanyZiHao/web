---
title: 常用的Linux命令
author: 白菜
date: '2022-04-27'
categories:
  - 'Linux'
tags:
  - Linux
issueId: 12
---

一份常用的 `Linux` 命令，后续会继续补充和添加

## `adduser` 添加用户 和 `passwd` 更改密码

```
# 添加一个名为 git 的用户
adduser git
# 设置 git 用户的密码
passwd git
```

当我们创建玩用户后发现它的权限比较低，需要给用户提升权限

```
# 会打开 sudoers 配置文件
sudo visudo
```

使用这个命令会比使用 `sudo vim /etc/ sudoers` 更安全， 除了对语法有校验，并且还会在多用户编辑的时候锁住文件。
打开 `sudoers` 配置文件后，我们添加这样一行配置：

```
# Allow git to run any commands anywhere
git ALL=(ALL:ALL) ALL
```

- git 表示规则应用的用户名
- 第一个 ALL 表示规则应用于所有 hosts
- 第二个 ALL 表示规则应用于所有 users
- 第三个 ALL 表示规则应用于所有 groups
- 第四个 ALL 表示规则应用于所有 commands

我们保存退出后，`git` 用户就会获得 `root` 权限。

## ls 列出文件和目录

ls 列出文件和目录
ls -la 由 -a 显示所有文件和目录（包括隐藏）和 -l 显示详细列表组成：

![alt](./../public/images/2022/linux/lsla.png 'lsla')
每一行都有 7 列

drwxrwxr-x 这里一共 10 位

第 1 位表示文件类型，其中 `-` 表示普通文件，`d` 表示目录文件。
第 2-4 位表示所有者权限, `r` 表示读权限，`w` 表示写权限，`x` 表示可执行权限， `-`表示无权限
第 5-7 位表示组用户权限，这里也是 rwx。
第 8-10 位，表示其他用户权限，这里是 r-x，表示有可读可执行权限，无写入权限。

补充：
`root` 用户创建文件夹的默认权限为 `rwxr-xr-x`,
而创建文件的默认权限是 `rw-r--r--`，注意创建文件默认会去掉 x 权限
这就需要我们在创建文件后，又加上执行权限。

## su 切换身份

```
# 切换为 git 用户
su git
```

## pwd 显示当前目录

```
$ pwd
/e/github/mini-skedo/app/dist
```

## cd 切换工作目录

### mkdir 创建目录

```
mkdir test
mkdir -p test/demo
```

## touch 创建文件

```
touch index.html
```

## echo 打印输出

```
echo "test index" > index.html
```

创建或覆盖文件内容`>` ,追加 `>>`
![alt](./../public/images/2022/linux/echo.jpg 'echo')

## cat

查看文件内容

清空 `/etc/test.txt` 文档内容：

```
cat /dev/null > index.html
```

把 `index.html` 的内容写入 `index2.html`

```
cat index.html > index2.html
```

把 `index.html` 的内容追加写入 `index2.html`

```
cat index.html >> index2.html
```

把 `index.html` 和 `index2.html` 追加写入 `index3.html`

```
cat index.html index2.html >> index3.html
```

## cp

使用指令 `cp` 将当前目录 `test/` 下的所有文件复制到新目录 `newtest` 下，输入如下命令：

```
cp –r test/ newtest
```

注意：用户使用该指令复制目录时，必须使用参数 `-r` 或者 `-R` 。

## mv

将文件 `aaa` 改名为 `bbb` :

```
mv aaa bbb
```

将 `info` 目录放入 `logs` 目录中。注意，如果 `logs` 目录不存在，则该命令将 `info` 改名为 `logs。`

```
mv info/ logs
```

再如将 /assets 下的所有文件和目录移到当前目录下，命令行为：

```
$ mv /assets/*  .
```

## rm

删除文件可以直接使用 `rm` 命令，若删除目录则必须配合选项`-r`

```
# rm  test.txt
rm：是否删除 一般文件 "test.txt"? y

# rm  dist
rm: 无法删除目录"dist": 是一个目录

# rm  -r  dist
rm：是否删除 目录 "dist"? y
```

## vi/vim

基本上 `vi/vim` 共分为三种模式，分别是命令模式（Command mode），输入模式（Insert mode）和底线命令模式（Last line mode）。 这三种模式的作用分别是：

### 命令模式：

用户刚刚启动 `vi/vim`，便进入了命令模式。

此状态下敲击键盘动作会被`Vim`识别为命令，而非输入字符

以下是常用的几个命令：

- i 切换到输入模式，以输入字符。
- x 删除当前光标所在处的字符。
- : 切换到底线命令模式，以在最底一行输入命令。

若想要编辑文本：启动 Vim，进入了命令模式，按下 i，切换到输入模式。
命令模式只有一些最基本的命令，因此仍要依靠底线命令模式输入更多命令。

### 输入模式

在命令模式下按下 i 就进入了输入模式。

在输入模式中，可以使用以下按键：

- 字符按键以及 Shift 组合，输入字符
- ENTER，回车键，换行
- BACK SPACE，退格键，删除光标前一个字符
- DEL，删除键，删除光标后一个字符
- 方向键，在文本中移动光标
- HOME/END，移动光标到行首/行尾
- Page Up/Page Down，上/下翻页
- Insert，切换光标为输入/替换模式，光标将变成竖线/下划线
- ESC，退出输入模式，切换到命令模式

### 底线命令模式

在命令模式下按下:（英文冒号）就进入了底线命令模式。

底线命令模式可以输入单个或多个字符的命令，可用的命令非常多。

在底线命令模式中，基本的命令有（已经省略了冒号）：

- q 退出程序
- w 保存文件

按 ESC 键可随时退出底线命令模式。

```
vim index.html
```

![alt](../public/images/2022/linux/vim01.jpg 'vim01')

按下 `i`，便会进入输入模式：左下角有插入 或者 `insert`

![alt](../public/images/2022/linux/vim02.jpg 'vim02')

输入内容

![alt](../public/images/2022/linux/vim03.jpg 'vim03')

保存退出，先输入 : 进入底线命令模式：wq

![alt](../public/images/2022/linux/vim04.jpg 'vim04')

查看文件内容

![alt](../public/images/2022/linux/vim05.jpg 'vim05')

## ssh 远程连接

```
ssh -p 300 my@127.0.0.1
```

-p 后面是端口

my 是服务器用户名

127.0.0.1 是服务器 ip

打开调试模式：

```
# -v 冗详模式，打印关于运行情况的调试信息
ssh -v my@127.0.0.
```

未完待续。。。

<!-- <LastUpdated /> -->

