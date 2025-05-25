export const normalizeUser = (user) => {
  if (!user) return null;

  const {
    password,
    documents,
    resetPasswordToken,
    resetPasswordExpires,
    ...safeUser
  } = typeof user?.toObject === "function" ? user.toObject() : user;

  return safeUser;
};
