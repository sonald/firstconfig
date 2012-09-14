UI组件的策略
===
firstconfig通过读取/etc/hippo.conf来决定UI上要设置哪些项，
具体参考下面hippo.conf的含义。


关于hippo.conf的规则
===

文件里的可选项的值及其含义如下：

RF_FULLDISK: 3代表格式化为三个主分区，2为两个主分区
RF_LANG：当前的语言的locale，比如zh_CN.UTF_8
RF_TIMEZONE：当前设置的时区的值，比如Asia/Kolkata
RF_KEYBOARD：当前设置的键盘方案的值，比如en

下面几项要么值为1要么在文件中不存在：
值为1表示firstconfig不需要设置。
RF_RFLICENSE
RF_HWLICENSE
RF_USERNAME
RF_PASSWD
RF_HOSTNAME
RF_EXTENDED：为1表示需要在firstconfig中进行分区操作

如果某个可选项存在则表示firstconfig不需要设置，不存在或注释就设置。
