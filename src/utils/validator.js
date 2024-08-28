const Joi = require('@hapi/joi');

const validate = async (req, res, validations) => {
    const schema = Joi.object(validations);
    const { error } = schema.validate(req.body);
    return error
};

module.exports = validate;
