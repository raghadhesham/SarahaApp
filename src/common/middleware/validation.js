export const validate = (schema) => {
  return (req, res, next) => {
    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        return res.status(400).json({ message: "validation error", error });
      }
    }
    next()
  };
};
