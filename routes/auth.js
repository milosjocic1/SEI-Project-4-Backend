const express = require("express");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const upload = require("../helper/fileUpload");
const authCntrl = require("../controllers/auth");

router.get("/auth/signup", authCntrl.auth_signup_get); // not used
router.post("/auth/signup", /*upload.single('image'),*/authCntrl.auth_signup_post);

router.get("/auth/signin", authCntrl.auth_signin_get);
router.post("/auth/signin", authCntrl.auth_signin_post);

router.get('/auth/logout', authCntrl.auth_logout_get);

router.get('/auth/update', authCntrl.auth_update_get);
router.post('/auth/update', authCntrl.auth_update_post);
// router.get('/auth/delete', authCntrl.auth_delete_get);

router.get('/auth/update_password', authCntrl.update_password_get);
router.post('/auth/update_password', authCntrl.update_password_post);

module.exports = router;