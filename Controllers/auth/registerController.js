import joi from 'joi';
import bcrypt from 'bcrypt'
import { User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';

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
        try {

            // store in database
            const result = await user.save()

            // Token Create
            access_token = JwtService.sign({ _id: result._id, role: result.role })
        } catch (error) {
            return next(err);
        }

        // Token Send
        res.json({ access_token: access_token })
    }
}

export default registerController