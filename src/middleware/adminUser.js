
const adminUser = (req, res, next) => {
    if (req.session.admin) { return next() }
    res.json({ error : -1, descripcion: 'Sólo administradores' })
}

export default adminUser