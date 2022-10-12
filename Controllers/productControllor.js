import { Product } from "../models";
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";
import fs from 'fs';
import productSchema from '../validators/productValidator';

const storage = multer.diskStorage({
    destination: (seq, file, cb) => cb(null, 'uploads/'),
    filename: (seq, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 }
}).single('image');

const productController = {
    async store(req, res, next) {

        // multipart form data
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }

            const filePath = req.file.path

            // validation
            const { error } = productSchema.validate(req.body);

            if (error) {
                // Delete uplor file
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message));
                    }
                })
                return next(error);
            }

            const { name, price, size } = req.body;
            let document;

            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                });

            } catch (err) {
                return next(err)
            }

            res.status(201).json(document)
        });
    },

    async update(req, res, next) {
        // multipart form data
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            let filePath;

            if (req.file) {
                filePath = req.file.path
            }

            // validation
            const { error } = productSchema.validate(req.body);

            if (req.file) {
                if (error) {
                    // Delete uplor file
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message));
                        }
                    })
                    return next(error);
                }
            }

            const { name, price, size } = req.body;
            let document;

            try {
                document = await Product.findByIdAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true });

            } catch (err) {
                return next(err)
            }

            res.status(201).json(document)
        });
    },

    async destroy(req, res, next) {
        try {
            const document = await Product.findOneAndRemove({ _id: req.params.id });
            if (!document) {
                return next(new Error('Nothing to Delete'))
            }

            // delete img 

            const imagePath = document._doc.img

            fs.unlink(`${appRoot}/${imagePath}`, (err) => {
                if (err) {
                    return next(CustomErrorHandler.serverError())
                }

                res.json(document);
            });
        } catch (err) {
            return next(err)
        }

    },
    async index(req, res, next) {
        let documenst;
        // pagination 
        // mongoose pagination

        try {
            documenst = await Product.find().select('-updatedAt -__v').sort({_id: -1}); 
        } catch (err) {
            return next(CustomErrorHandler.serverError())
        }
        return res.json(documenst);
    }
}

export default productController;
