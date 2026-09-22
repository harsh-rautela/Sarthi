import { Router } from 'express'; import {protect} from '../middleware/auth.js'; import {chat} from '../controllers/aiController.js'; const r=Router(); r.post('/chat',protect,chat); export default r;
