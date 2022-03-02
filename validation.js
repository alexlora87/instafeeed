const validator = require("validator");
const moment = require("moment");
const clc = require("cli-color");

const articleProp = {
  idLength: 36,
  titleMaxLength: 255,
  authorMaxLength: 100,
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

const articleAllowedFields = [
  "id",
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
  "id",
  "title",
  "author",
  "modifiedAt",
  "readMins",
  "source",
];

const logInfo = (text) => console.log(`- ${text}`);
const logSuccess = () => console.log(clc.green("☑ OK"));
const logError = (text) => console.log(`${clc.red("☒")} ${text}`);

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

function validateId(id) {
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
}

function validateMaxLength(propName, propValue, maxLength) {
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
}

function validateModified(date) {
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
}

function validatePublished(date) {
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
}

function validateURL(url) {
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
}

function validateKeywords(keywords) {
  logInfo("Keywords");

  if (Array.isArray(keywords)) {
    if (keywords.length < 1 || keywords.length > 3) {
      logError("Keywords size must be between 1 and 3");
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
}

function validateReadMins(readMins) {
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
}

function validateSource(source) {
  logInfo("Source");

  if (sources[source] != null) {
    logSuccess();
    return true;
  } else {
    logError("Provided source is not valid");
    return false;
  }
}

function validateJSON(article) {
  console.log(clc.blueBright("Validating JSON structure"));
  const fields = validateFields(article);
  const id = validateId(article.id);
  const title = validateMaxLength(
    "Title",
    article.title,
    articleProp.titleMaxLength
  );
  const author = validateMaxLength(
    "Author",
    article.author,
    articleProp.authorMaxLength
  );
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
}

module.exports = validateJSON;
