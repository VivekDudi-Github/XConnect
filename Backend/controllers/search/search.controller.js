import { ResSuccess, TryCatch } from '../../utils/extra.js';
import * as searchService from './search.service.js';
import * as schema from './search.validator.js';
import { validate } from '../../middlewares/validate.js';

export const searchBarSearch = TryCatch(async (req, res) => {
  validate(schema.searchQuerySchema , req)

  const data = await searchService.autocompleteSearch(req.query.q);
  return ResSuccess(res, 200, { autocomplete: data });
}, 'searchBarSearch');

export const normalSearch = TryCatch(async (req, res) => {
  validate(schema.searchQuerySchema , req ) 

  const result = await searchService.normalSearch({
    q: req.query.q,
    page: req.query.page,
    userId: req.user._id
  });

  return ResSuccess(res, 200, result);
}, 'normalSearch');

export const continueSearch = TryCatch(async (req, res) => {
  validate(schema.continueSearchSchema , req )

  const results = await searchService.continueSearch({
    q: req.query.q,
    tab: req.query.tab,
    page: req.query.page,
    userId: req.user._id
  });

  return ResSuccess(res, 200, results);
}, 'continueSearch');
 
export const searchUsers = TryCatch( async(req , res) => {
  validate(schema.searchQuerySchema , req )

  const result = await searchService.searchUsers({
    q : req.query.q ,
    page : req.query.page ,
    userId : req.user._id ,
  })

  return ResSuccess(res, 200 , result)

} , 'searchUsers')