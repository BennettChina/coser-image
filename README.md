# 简介

此项目为 [SilveryStar/Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT) 衍生插件，用于实现获取米游社Coser图片功能。

该项目是本人将 [Extrwave](https://github.com/Extrwave) 的 [Adachi-GBOT-Plugin/coser-image](https://github.com/Extrwave/Adachi-GBOT-Plugin/tree/coser-image) 修改后适配 [SilveryStar/Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT) 而创建。

# 安装插件

进入 `Adachi-GBOT/src/plugins` 目录下，执行如下命令

```bash
git clone https://github.com/BennettChina/coser-image.git
```

使用镜像加速下载

```shell
git clone https://ghproxy.com/https://github.com/BennettChina/coser-image.git
```

需要注意的时 `GitClone` 镜像同步比较慢(夜间同步)，因此如果 `pull` 时未拉取到内容可将插件删掉用 `Ghproxy` 重新克隆。

```shell
git clone https://gitclone.com/github.com/BennettChina/coser-image.git
```

> 感谢[GitClone](https://gitclone.com/) 和 [GitHub Proxy](https://ghproxy.com/) 提供的镜像服务！

或通过本项目仓库左上角 `code -> Download.zip` 下载压缩包，解压至 `Adachi-BOT/src/plugins` 目录内

> 注意：若使用下载压缩包方式，请务必将目录名称改完 `coser-image` ，否则插件无法启动

## 更新方法

进入 `Adachi-BOT/src/plugins/coser-image` 目录下，执行以下命令即可

```bash
git pull
```

当然你也可以直接 下载本项目压缩包 整包替换。

# 使用方法

```
# 随机获取一张coser图
命令: <header> cos
范围: 群/私聊
权限: 用户 (User)

# 加载更多coser图
命令: <header> cos more
范围: 群/私聊
权限: 用户 (User)

# 获取一张二次元风格的图片
命令: <header> cos ani
范围: 群/私聊
权限: 用户 (User)
```

## 展示

![coser](http://cdn.ethreal.cn/img/1656477361198-1656477362.png)

![more coser](http://cdn.ethreal.cn/img/1656477386091-1656477387.png)

# 其他

数据来源：https://bbs.mihoyo.com/ys/home/49

