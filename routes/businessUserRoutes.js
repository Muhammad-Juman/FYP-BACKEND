import express from 'express';
import { registerBusinessUser, loginBusinessUser,getBookMarksByUserID,removeBookMark,addBookmark,addRecentView,getRecentView } from '../controllers/businessUserController.js';
import verifyToken from '../middleware/verifyToken.js'
const router = express.Router();

router.post('/signup', registerBusinessUser);
router.post('/login', loginBusinessUser);
router.post('/bookmarks/add',verifyToken,addBookmark );
router.post('/bookmarks/remove',verifyToken,removeBookMark );
router.get('/bookmarks/:userId',verifyToken,getBookMarksByUserID);
// POST /api/users/:userId/recent-views
router.post('/:userId/recent-views',verifyToken, addRecentView);

// GET /api/users/:userId/recent-views
router.get('/:userId/recent-views',verifyToken,getRecentView );

export default router;
