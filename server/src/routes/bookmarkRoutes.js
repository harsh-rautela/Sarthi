import { Router } from 'express'; import {protect} from '../middleware/auth.js'; import {listBookmarks,addBookmark,removeBookmark} from '../controllers/bookmarkController.js';
const r=Router(); r.use(protect); r.get('/',listBookmarks); r.post('/:schemeId',addBookmark); r.delete('/:schemeId',removeBookmark); export default r;
