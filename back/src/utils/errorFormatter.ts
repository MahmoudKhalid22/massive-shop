import { ValidationError } from "yup";

export const formatValidationErrors = (err: ValidationError) => {
  const formattedErrors: Record<string, string[]> = {};

  err.inner.forEach((error) => {
    const field = error.path;
    if (field) {
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.message);
    }
  });

  return formattedErrors;
};

