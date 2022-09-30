import express from 'express';
const router = express.Router();
import { loginController, registerController } from '../Controllers';

router.post('/register', registerController.register)
router.post('/login', loginController.login)

export default router;