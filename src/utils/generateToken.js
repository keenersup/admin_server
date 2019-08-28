import jwt from 'jsonwebtoken'
import {
  SECRET_KEY, ACCESSTOKEN_EXPIRED,
  REFRESH_SECRET_KEY, REFRESHTOKEN_EXPIRED
} from "../../config";

// secret, secret2 는 함수 인자.

export const generateTokens = (user, secret, secret2, clientId) => {

  const generateAccessToken = jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    clientId,
  }, secret, { expiresIn: ACCESSTOKEN_EXPIRED })

  const generateRefreshToken = jwt.sign({
    id: user.id,
    clientId,
  }, secret2, { expiresIn: REFRESHTOKEN_EXPIRED })

  return [generateAccessToken, generateRefreshToken]
}

export const refreshTokens = async (accessToken, user, clientId) => {

  const refreshSecret = user.password + REFRESH_SECRET_KEY

  // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  //
  // console.log(ip);

  try {
    const verifiedToken = await jwt.verify(user.refreshToken, refreshSecret)
    if (verifiedToken.clientId !== clientId) {
      throw { clientId: 'clientId changed' }
    }
    const [newAccessToken, newRefreshToken] = await generateTokens(user, SECRET_KEY, refreshSecret, clientId);
    return [newAccessToken, newRefreshToken]
  } catch (err) {
    console.log(err);
    throw { refreshToken: 'refresh Token error' }
  }
}











