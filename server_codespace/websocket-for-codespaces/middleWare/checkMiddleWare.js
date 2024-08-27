import { validationResult } from "express-validator"

export default function (req, res, next) {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) });
            throw new ErrorServer(`Validation error: ${errors.array({ onlyFirstError: true })}`)
        }
        next();
    } catch(e) {
        next(e)
    }
};