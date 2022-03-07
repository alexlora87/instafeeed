const validator = require("validator");
const moment = require("moment");
const clc = require("cli-color");
const Joi = require("joi");

/**
 * UTILS
 */

const articleProp = {
  idLength: 36,
  titleMaxLength: 255,
  authorMaxLength: 100,
  keywordsSize: [1, 3],
  readMins: [1, 20],
  dateFormat: "MM/DD/YYYY",
};

const sources = {
  ARTICLE: "ARTICLE",
  BLOG: "BLOG",
  TWEET: "TWEET",
  NEWSPAPER: "NEWSPAPER",
};

const isValidDateFormat = (date) =>
  moment(date, articleProp.dateFormat, true).isValid();

const isValidSource = (source) => sources[source] != null;

const logInfo = (text) => console.log(`- ${text}`);
const logSuccess = () => console.log(clc.green("☑ OK"));
const logError = (text) => console.log(`${clc.red("☒")} ${text}`);

/**
 * MANUAL VALIDATION
 */

const articleAllowedFields = [
  "_id",
  "title",
  "author",
  "modifiedAt",
  "publishedAt",
  "url",
  "keywords",
  "readMins",
  "source",
];
const articleRequiredFields = [
  "_id",
  "title",
  "author",
  "modifiedAt",
  "readMins",
  "source",
];

const validateStructure = (fields) =>
  Object.keys(fields).every((field) => articleAllowedFields.includes(field));

const validateRequired = (fields) =>
  articleRequiredFields.every((field) => Object.keys(fields).includes(field));

function validateFields(fields) {
  logInfo("Fields");

  const structure = validateStructure(fields);
  const required = validateRequired(fields);
  if (structure && required) {
    logSuccess();
  } else {
    if (!structure) {
      logError("Invalid structure");
    }
    if (!required) {
      logError("Required field is missing");
    }
  }

  return structure && required;
}

const validateId = (id) => {
  logInfo("ID");

  if (id != null) {
    const verifyEmpty = id.trim().length > 0;
    const verifyLength = id.length === articleProp.idLength;

    if (!verifyEmpty) {
      logError(`ID cannot be empty`);
    }
    if (!verifyLength) {
      logError(`ID length is different from ${articleProp.idLength}`);
    }
    if (verifyEmpty && verifyLength) {
      logSuccess();
    }

    return verifyEmpty && verifyLength;
  } else {
    logError(`Id cannot be null`);
    return false;
  }
};

const validateMaxLength = (propName, propValue, maxLength) => {
  logInfo(propName);

  if (propValue != null) {
    const verifyEmpty = propValue.trim().length > 0;
    const verifyLength = propValue.length <= maxLength;

    if (!verifyEmpty) {
      logError(`${propName} cannot be empty`);
    }
    if (!verifyLength) {
      logError(`${propName} max length is ${maxLength}`);
    }
    if (verifyEmpty && verifyLength) {
      logSuccess();
    }

    return verifyEmpty && verifyLength;
  } else {
    logError(`${propName} cannot be null`);
    return false;
  }
};

const validateModified = (date) => {
  logInfo("Modified At");

  if (isValidDateFormat(date)) {
    if (new Date() <= new Date(date)) {
      logError("Modified At cannot be later than the Current Date");
      return false;
    } else {
      logSuccess();
      return true;
    }
  } else {
    logError("Invalid date format: use MM/DD/YYYY");
    return false;
  }
};

const validatePublished = (date) => {
  if (date != null && date.trim().length > 0) {
    logInfo("Published At");

    if (isValidDateFormat(date)) {
      if (new Date() <= new Date(date)) {
        logError("Published At cannot be later than the Current Date");
        return false;
      } else {
        logSuccess();
        return true;
      }
    } else {
      logError("Invalid date format: use MM/DD/YYYY");
      return false;
    }
  }
};

const validateURL = (url) => {
  if (url != null && url.trim().length > 0) {
    logInfo("URL");

    if (validator.isURL(url)) {
      logSuccess();
      return true;
    } else {
      logError("Invalid URL");
      return false;
    }
  }
};

const validateKeywords = (keywords) => {
  logInfo("Keywords");

  if (Array.isArray(keywords)) {
    const [min, max] = articleProp.keywordsSize;
    if (keywords.length < min || keywords.length > max) {
      logError(`Keywords size must be between ${min} and ${max}`);
      return false;
    } else {
      let keywordError = false;
      keywords.forEach((keyword) => {
        if (keyword == null) {
          keywordError = true;
        } else {
          if (typeof keyword != "string" && keyword.trim().length <= 0) {
            keywordError = true;
          }
        }
      });

      if (keywordError) {
        logError("Each keyword must be a string");
      } else {
        logSuccess();
        return true;
      }

      return keywordError;
    }
  } else {
    logError("Keywords must be a list");
    return false;
  }
};

const validateReadMins = (readMins) => {
  const [min, max] = articleProp.readMins;
  if (readMins != null) {
    logInfo("Read Mins");

    if (typeof readMins == "number") {
      if (readMins >= min || readMins >= max) {
        logSuccess();
        return true;
      } else {
        logError(`Only numbers beetween ${min} and ${max}`);
        return false;
      }
    } else {
      logError("Only numbers allowed");
      return false;
    }
  } else {
    logError("Only numbers allowed");
    return false;
  }
};

const validateSource = (source) => {
  logInfo("Source");

  if (isValidSource(source)) {
    logSuccess();
    return true;
  } else {
    logError("Provided source is not valid");
    return false;
  }
};

const manualValidation = (article) => {
  console.log(clc.blueBright("Validating JSON structure"));
  const fields = validateFields(article);
  const id = validateId(article._id);
  const title = validateMaxLength(
    "Title",
    article.title,
    articleProp.titleMaxLength
  );
  const author = validateId(article.author);
  const modifiedAt = validateModified(article.modifiedAt);
  const publishedAt = validatePublished(article.publishedAt);
  const url = validateURL(article.url);
  const keywords = validateKeywords(article.keywords);
  const readMins = validateReadMins(article.readMins);
  const source = validateSource(article.source);

  return (
    fields &&
    id &&
    title &&
    author &&
    modifiedAt &&
    publishedAt &&
    url &&
    keywords &&
    readMins &&
    source
  );
};

/**
 * JOI VALIDATION
 */

const dateValidation = (date) => {
  if (isValidDateFormat(date)) {
    if (new Date() <= new Date(date)) {
      throw new Error("Modified At cannot be later than the Current Date");
    } else {
      return date;
    }
  } else {
    throw new Error("Invalid date format: use MM/DD/YYYY");
  }
};

const sourceValidation = (source, helpers) => {
  if (isValidSource(source)) {
    return source;
  } else {
    return helpers.error("any.invalid");
  }
};

const articleSchema = Joi.object({
  _id: Joi.string().length(articleProp.idLength).required(),
  title: Joi.string().max(articleProp.titleMaxLength).required(),
  author: Joi.string().length(articleProp.idLength).required(),
  modifiedAt: Joi.string().custom(dateValidation).required(),
  publishedAt: Joi.string().allow(null, "").custom(dateValidation),
  url: Joi.string().allow(null, "").uri(),
  keywords: Joi.array()
    .items(Joi.string())
    .min(articleProp.keywordsSize[0])
    .max(articleProp.keywordsSize[1]),
  readMins: Joi.number()
    .integer()
    .min(articleProp.readMins[0])
    .max(articleProp.readMins[1])
    .required(),
  source: Joi.string().custom(sourceValidation).required(),
});

const validateArticle = (article) => Joi.assert(article, articleSchema);

module.exports = {
  manualValidation,
  validateArticle,
};
