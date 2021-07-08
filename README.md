# swagger-helper
将 swagger 接口内容输出到Api Mocker的命令行工具。

具体使用命令为：

```
print -f [-c]			 调试输出swagger接口内容和转换后的接口内容
			 -f 		 数据来源（使用swagger来源，格式为swagger:/api/path）
		     -c 		 是否转换，无此参数输出原始swagger接口内容			
listGroup                获取group列表
listApi [-g] [-n] [-i]   获取api列表
             -g          获取指定group下的api列表，无此参数获取自己创建的api列表
             -n          页大小  
             -i          页数
createApi -f -g          创建api
             -f          数据来源（使用swagger来源，格式为swagger:/api/path）
             -g          group id
updateApi -f -a -g       更新api
             -f          数据来源（使用swagger来源，格式为swagger:/api/path）
             -a          api id
             -g          group id
deleteApi -g -a          删除api
             -g          group id
             -a          api id
```

