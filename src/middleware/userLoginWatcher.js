
const userLoginWatcher = (req, res, next) => {
    req.isAuthenticated() ? next() : res.render('timeout')
}

export default userLoginWatcher