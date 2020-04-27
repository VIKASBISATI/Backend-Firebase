const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
};

exports.validateSignUp = data => {
  let errors = {};
  if (data.email.trim() === "") {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }
  if (data.password.trim() === "") {
    errors.password = "Must not be empty";
  }
  if (data.confirmPassword.trim() === "") {
    errors.confirmPassword = "Must not be empty";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Must be same";
  }
  if (data.handle.trim() === "") {
    errors.handle = "Must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
exports.validateLogin = req => {
  let errors = {};
  if (req.body.email.trim() === "") {
    errors.email = "Must not be empty";
  }
  if (req.body.password.trim() === "") {
    errors.password = "Must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
exports.reduceUserDetails = data => {
  let userDetails = {};
  if (!(data.bio.trim() === "")) {
    userDetails.bio = data.bio;
  }
  if (!(data.website.trim() === "")) {
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else {
      userDetails.website = data.website;
    }
  }
  if (!(data.location.trim() === "")) {
    userDetails.location = data.location;
  }
  return userDetails;
};
