import express from 'express';
const router = express.Router();
import { loginController, registerController, userController, refreshController, productController } from '../Controllers';
import admin from '../middlewares/admin';
import auth from '../middlewares/auth';

router.post('/register', registerController.register)
router.post('/login', loginController.login)
router.get('/me', auth, userController.me);
router.post('/refresh', refreshController.refresh);
router.post('/logout', auth, loginController.logout);

router.post('/products', [auth, admin], productController.store);


export default router;