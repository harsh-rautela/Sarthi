import { Router } from 'express'; import { protect } from '../middleware/auth.js'; import { getProfile, updateProfile } from '../controllers/profileController.js';
const r=Router(); r.use(protect); r.get('/',getProfile); r.put('/',updateProfile); export default r;
