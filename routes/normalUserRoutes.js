import express from 'express';
import { registerNormalUser, loginNormalUser, addBookmark,removeBookMark,getBookMarksByUserID,addRecentView,getRecentView,switchToBusinessAccount} from '../controllers/normalUserController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/signup', registerNormalUser);
router.post('/login', loginNormalUser);
router.post('/bookmarks/add',verifyToken,addBookmark );
router.post('/bookmarks/remove',verifyToken,removeBookMark );
router.get('/bookmarks/:userId',verifyToken,getBookMarksByUserID);

// POST /api/users/:userId/recent-views
router.post('/:userId/recent-views',verifyToken, addRecentView);

// GET /api/users/:userId/recent-views
router.get('/:userId/recent-views',verifyToken,getRecentView );
router.post('/switch-to-business/:userId',switchToBusinessAccount)


export default router;
