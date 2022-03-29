module.exports = (req, res, next) => {
  let ret = req.ret()

  try {
    // if (!res.locals.login) {
    //   ret.setCode(401)
    //   throw new Error('Usuário não autenticado')
    // }

    next()
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
