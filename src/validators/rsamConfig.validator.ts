// validators/rsamConfig.validator.ts
import { body } from 'express-validator';

export const updateRsamConfigValidation = [
  body('trigger_on')
    .optional()
    .isNumeric().withMessage('trigger_on must be a number'),
  
  body('trigger_off')
    .optional()
    .isNumeric().withMessage('trigger_off must be a number'),
  
  body('audio_url')
    .optional()
    .isString().withMessage('audio_url must be a string')
];