const arrayFields = ["hashtags", "mentions", "videoIds"]
const booleanFields = ["isCommunityPost", "isAnonymous"]


const parseMultipartFields = (req, res, next) => {
  console.log(req?.body);
  arrayFields.forEach(field => {
    if (req?.body?.[field]) {
      req.body[field] = Array.isArray(req.body[field])
        ? req.body[field]
        : [req.body[field]]
    }
  })

  const scheduledAt = req?.body?.scheduledAt;
  

  if (scheduledAt || scheduledAt === "") {
    if (!Number.isNaN(new Date(scheduledAt).getTime() )) {
      req.body.scheduledAt = new Date(scheduledAt);
    } else {
      delete req.body.scheduledAt; 
    };
  }

  booleanFields.forEach(field => {
    if (req?.body?.[field] !== undefined) {
      req.body[field] = req.body[field] === "true"
    }
  })

  next()
}

export default parseMultipartFields