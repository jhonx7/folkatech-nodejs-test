const User = require("../models/User");
const Joi = require('@hapi/joi');
const validate = require("../utils/validator");

const redisClient = require("../utils/redisClient")
class UserController {

  async index(req, res) {

    const cacheKey = req.originalUrl || req.url;

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? req.query.limit : 10
    const search = req.query.search ? req.query.search : null
    const order_by = req.query.order_by ? req.query.order_by : 'asc'
    const sort_by = req.query.sort_by == 'created_at' ? 'createdAt' : req.query.sort_by
    let query = {},
      users, total, sortOrder = ''

    if (order_by == 'asc') {
      sortOrder = `${sort_by}`;
    } else if (order_by == 'desc') {
      sortOrder = `-${sort_by}`;
    } else {
      sortOrder = `-createdAt`;
    }

    try {
      const count = await User.countDocuments()
      if (search !== null) {
        query = {
          $or: [
            {
              userName: {
                $regex: search,
                $options: "i"
              }
            },
            {
              emailAddress: {
                $regex: search,
                $options: "i"
              }
            }
          ]
        }

        users = await User.find(query)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(`${sortOrder}`)
          .exec()
      } else {
        users = await User.find()
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(`${sortOrder}`)
          .exec()
      }

      total = users.length
      let data = {
        users,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
      if (total != 0) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
      }
      res.status(200).json({
        message: 'Success Get User',
        data,
      })
    } catch (error) {
      res.status(500).json({
        error,
      })
    }
  }

  async create(req, res) {
    const unvalidated = await validate(req, res, {
      userName: Joi.string().min(5).required(),
      accountNumber: Joi.required(),
      emailAddress: Joi.string().email().required(),
      identityNumber: Joi.required(),
    })

    if (unvalidated) {
      return res.status(422).send({ errors: unvalidated.details });
    }

    const {
      userName,
      accountNumber,
      emailAddress,
      identityNumber,
    } = req.body;

    const emailUser = await User.findOne({
      emailAddress
    });
    const accountNumberUser = await User.findOne({
      accountNumber
    });
    const identityNumberUser = await User.findOne({
      identityNumber
    });

    if (emailUser) {
      return res.status(422).json({
        message: "Email is registered"
      });
    }

    if (accountNumberUser) {
      return res.status(422).json({
        message: "Account Number is registered"
      });
    }

    if (identityNumberUser) {
      return res.status(422).json({
        message: "Identity Number is registered"
      });
    }

    const newUser = new User({
      userName,
      accountNumber,
      emailAddress,
      identityNumber,
    })

    try {
      await newUser.save()

      return res.status(201).json({
        message: 'Success add data',
        data: newUser
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        message: 'Server error'
      })
    }
  }

  async read(req, res) {
    const cacheKey = req.originalUrl || req.url;

    const {
      id,
      accountNumber,
      identityNumber,
    } = req.query;

    let user = null;
    try {
      if (id) {
        user = await User.findById(id)
      }
      else if (accountNumber) {
        user = await User.findOne({ accountNumber })
      }
      else if (identityNumber) {
        user = await User.findOne({ identityNumber })
      }
      else {
        return res.status(422).json({
          message: "Bad Request"
        })
      }
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
      return res.status(200).json({
        message: 'Success Get User',
        data: user
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        message: 'Server error'
      })
    }
  }

  async update(req, res) {
    const unvalidated = await validate(req, res, {
      userName: Joi.string().min(5).required(),
      accountNumber: Joi.required(),
      emailAddress: Joi.string().email().required(),
      identityNumber: Joi.required(),
    })

    if (unvalidated) {
      return res.status(422).send({ errors: unvalidated.details });
    }

    try {
      const id = req.params.id;
      const {
        userName,
        accountNumber,
        emailAddress,
        identityNumber,
      } = req.body;

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }

      const emailUser = await User.findOne({
        $and: [{
          emailAddress
        },
        {
          emailAddress: {
            $ne: user.emailAddress
          }
        }]
      });
      if (emailUser) {
        return res.status(422).json({
          message: "Email is registered"
        });
      }

      const accountNumberUser = await User.findOne({
        $and: [{
          accountNumber
        },
        {
          accountNumber: {
            $ne: user.accountNumber
          }
        }]
      });
      if (accountNumberUser) {
        return res.status(422).json({
          message: "Account Number is registered"
        });
      }

      const identityNumberUser = await User.findOne({
        $and: [{
          identityNumber
        },
        {
          identityNumber: {
            $ne: user.identityNumber
          }
        }]
      });
      if (identityNumberUser) {
        return res.status(422).json({
          message: "Identity Number is registered"
        });
      }

      user.userName = userName
      user.emailAddress = emailAddress
      user.accountNumber = accountNumber
      user.identityNumber = identityNumber
      await user.save()

      return res.status(201).json({
        message: 'Success Update Data',
        data: user
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        code: 500,
        message: 'Server Error'
      })
    }
  }

  async delete(req, res) {
    const id = req.params.id;

    try {
      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }
      return res.status(200).json({
        message: 'Success delete User',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Server Error',
      })
    }
  }

}

module.exports = new UserController;