import joi from 'joi';
import bcrypt from 'bcrypt'
import { RefreshToken, User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../Config';

const registerController = {
    async register(req, res, next) {

        // validation
        const regidterSchema = joi.object({
            name: joi.string().min(3).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: joi.ref('password')
        });

        const { error } = regidterSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        // check if user is in the database alseady
        try {
            const exist = await User.exists({ email: req.body.email });

            if (exist) {
                return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
            }
        } catch (err) {
            return next(err);
        }

        const { name, email, password } = req.body;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // prepare the model 
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        let access_token;
        let refresh_token;

        try {

            // store in database
            const result = await user.save()

            // Token Create
            access_token = JwtService.sign({ _id: result._id, role: result.role })
            refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET)
            // database whitelist

            await RefreshToken.create({ token: refresh_token })
        } catch (error) {
            return next(err);
        }

        // Token Send
        res.json({ access_token, refresh_token })
    }
}

export default registerController