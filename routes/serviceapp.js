const express = require('express');
const router = express.Router();

const User = require('../Controller/userController');
const servicerequest = require('../Controller/servicerequestController');
const service = require('../Controller/serviceController');
const comment = require('../Controller/commentController');

// User Registraton 

router.post('/user', User.registration);
router.put('/user', User.updateUser);
router.delete('/user', User.deleteUser);
// router.put('/password', User.updatePassword);
router.post('/login', User.loginuser);
router.put('/logout', User.logOut);
router.post('/service', service.createService);
router.put('/service/:id', service.updateService);
router.get('/service', service.getProviderServices);
router.get('/servicelist', service.listOfServices);
router.delete('/service/:id', service.serviceDelete);
router.post('/servicerequest', servicerequest.createRequest);
router.delete('/servicerequest/:id', servicerequest.deleteRequest);
router.get('/servicerequest', servicerequest.getuserRequest);
router.put('/servicerequest/:id', servicerequest.updateRequestStatus);
router.post('/comment', comment.addComment);
router.get('/comment/:id', comment.getComment);
// router.delete('/comment/:id', comment.getComment);

module.exports=router;