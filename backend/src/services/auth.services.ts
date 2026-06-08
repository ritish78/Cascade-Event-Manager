import { findUserByEmail } from "src/repository/auth.repository";
import { passwordMatches } from "src/utils/hashPassword";
import { generateJWT } from "src/utils/jwt";

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    //The error message should be vague and same for when the user has incorrect password
    //Might need to setup a constant for it later
    throw new Error("Invalid Credentials!");
  }

  if (!user.is_active) {
    throw new Error("Please contact admin to login!");
  }

  if (!user.is_verified) {
    throw new Error("Email is not verified! Please verify email to continue!");
  }

  const isPasswordSame = await passwordMatches(password, user.password);

  if (!isPasswordSame) {
    //Same error message as above.
    throw new Error("Invalid Credentials!");
  }

  const tokens = generateJWT(user.id, user.full_name);

  return {
    ...tokens,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      isVerified: user.is_verified,
      isActive: user.is_active,
    },
  };
};
