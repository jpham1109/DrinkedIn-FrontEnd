export const cocktailFormOptions = {
  name: {
    required: "Please enter a name for your cocktail",
    minLength: {
      value: 1,
      message: "Name must be at least 1 character",
    },
  },
  description: {
    required: "Please give a description of your cocktail",
    minLength: {
      value: 3,
      message: "Description must be at least 3 characters",
    },
  },
  execution: {
    required: "Please detail how the cocktail is made",
    minLength: {
      value: 3,
      message: "Execution must be at least 3 characters",
    },
  },
  ingredients: { required: "Please list the ingredients for your cocktail" },
  category: { required: "Please choose a category for your cocktail" },
};

export const registerOptions = {
  username: {
    required: "Please enter a username",
    minLength: {
      value: 3,
      message: "Username must be at least 3 characters",
    },
  },
  password: {
    required: "Please enter a password",
    minLength: {
      value: 3,
      message: "Password must be at least 3 characters",
    },
  },
};
