const mainPageRender = async (req, res) => {
  const userName = req.user.email;
  const permissions = req.user.permissions;
  res.render("index", {
    userName: userName,
    permissions: permissions,
  });
};

export { mainPageRender };
