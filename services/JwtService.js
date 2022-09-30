import { JWT_SECRET } from "../Config";
import jwt from 'jsonwebtoken'
class JwtService {
    static sign(payload, expiry = '60s', Secret = JWT_SECRET) {
        return jwt.sign(payload, Secret, { expiresIn: expiry })
    }

    static verify(token, Secret = JWT_SECRET) {
        return jwt.verify(token, Secret)
    }
}

export default JwtService;