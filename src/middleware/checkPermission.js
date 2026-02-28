export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    if (req.user.isAdmin) {
      return next();
    }

    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).send("Forbidden");
    }

    next();
  };
};
