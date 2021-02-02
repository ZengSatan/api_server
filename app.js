// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()

const joi = require('@hapi/joi')

// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())

// 配置解析 `application/x-www-form-urlencoded` 格式的表单数据的中间件
app.use(express.urlencoded({
  extended: false
}))

// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))

// 在处理函数中，需要多次调用 `res.send()` 向客户端响应 `处理失败` 的结果，为了简化代码，可以手动封装一个 res.cc() 函数
// 一定要在路由之前分装 res.cc 函数
app.use((req, res, next) => {
  res.cc = function (err, status = 1) {
    // status 默认值为1，表示失败的情况
    // err 的可能是错误对象，也可能是错误的描述字符串
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// 在 `app.js` 中注册路由之前，配置解析 Token 的中间件
// 解析 token 的中间件
const expressJWT = require('express-jwt')
// 导入配置文件
const config = require('./config')

app.use(expressJWT({
  secret: config.jwtSecretKey
}).unless({
  path: [/^\/api\//]
}))

// 导入并使用用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)
// 导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)
// 导入并使用文章路由模块
const articleRouter = require('./router/article')
// 为文章的路由挂载统一的访问前缀 /my/article
app.use('/my/article', articleRouter)

// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, () => {
  console.log('api server running at http://127.0.0.1:3007')
})