function validate(schema, source = "body") {
  return (req, res, next) => {
    const payload = req[source];
    const { error, value } = schema.validate(payload, { abortEarly: false });

    if (error) {
      const details = error.details.map((item) => item.message).join(", ");
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${details}`
      });
    }

    req[source] = value;
    next();
  };
}

module.exports = { validate };
