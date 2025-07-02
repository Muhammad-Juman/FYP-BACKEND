import express from 'express';
import { addProperty,getPropertiesByUser,updateProperty,getPropertyByType,searchProperties } from '../controllers/propertyController.js';
import { upload } from '../middleware/upload.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/add',verifyToken, upload.array('images', 10), addProperty);
router.get("/user/:userId",verifyToken, getPropertiesByUser);
router.put('/:id',verifyToken, upload.array('images'),updateProperty );
router.get('/all',getPropertyByType);
router.get('/search',searchProperties)


export default router;
