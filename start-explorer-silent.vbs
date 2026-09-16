' ============================================================
'  Explorer 静默启动器
'  双击这个文件即可：无窗口、自动启动服务器、自动打开浏览器
' ============================================================

Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")

' 切换到脚本所在目录
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = scriptDir

' 启动服务器（窗口最小化，不抢焦点）
'  第二个参数：0=隐藏 1=正常 2=最小化 3=最大化 7=最小化不激活
sh.Run "cmd /c python server.py", 7, False

' 等服务器起来
WScript.Sleep 3000

' 打开浏览器
sh.Run "http://localhost:8080", 1, False