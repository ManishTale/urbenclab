const usermodel = require('../Module/userModel');
const servicerequest = require('../Module/service_reqModel');
const service = require('../Module/serviceModel');  
const comment = require('../Module/commentsModel');
const commonData = require('../common');
const bcrypt = require('bcrypt');

exports.registration = (req, res) => {
  if(!req.body.username || !req.body.email || !req.body.password || !req.body.type){
    res.send(commonData.responseJSON(404, 'Fill Fields are Mendetory'));
  }
  else{
    usermodel.count({email: req.body.email},(err, serviceData) => {
    if (serviceData > 0) {
      res.send(commonData.responseJSON(500, 'Email Already Exist'));
       } else {
          var pass = bcrypt.hashSync(req.body.password, 10);
          var UserModel = new usermodel({
              username: req.body.username,
              email: req.body.email,
              password: pass,
              type: req.body.type,
              token: ''
          });
          usermodel(UserModel).save( (err, result) => {
              if(err){
                res.send(commonData.responseJSON(500, 'Error!', err.message));
              }
              else{
                  res.send(commonData.responseJSON(200, 'Successfully Registered', result));
              }
          });
       }
      });
  }
};

exports.loginuser = (req, res) => { 
  if(!req.body.email || !req.body.password){
    res.send(commonData.responseJSON(404, 'Fill Fields are Mendetory'));
  }
  else{
    var pass = req.body.password;
          usermodel.findOne({email: req.body.email},(err, userData) => {
             if(err || !userData){
              res.send(commonData.responseJSON(500, 'Email not found'));
             }
             else{
                bcrypt.compare(pass, userData.password, (err, isMatch) => {
                    if (err) {
                      res.send(commonData.responseJSON(500, 'Password is not Correct', err));
                    }else{
                    if(isMatch){
                      var NewToken = Math.random().toString(36).replace('O.', ''); 
                        usermodel.findOneAndUpdate({_id: userData._id},{ $set: { token: NewToken } },(err, tokenData) => {
                              if (err) {
                                res.send(commonData.responseJSON(500, 'Error!', err));
                              } else {
                                  if(tokenData.type == 'user'){
                                      servicerequest.find({user_id: tokenData._id}).populate('service_id').exec((err, serviceReqData) => {
                                        if (err) {
                                          res.send(commonData.responseJSON(500, 'Error!', err));
                                        }
                                        else {
                                          var objData = {token: NewToken, ServiceRequest: serviceReqData};
                                        res.send(commonData.responseJSON(200, 'Welcome User', objData));
                                        }
                                      });
                                    }
                                    else if(tokenData.type == 'admin'){
                                      service.find({ provider_id: tokenData._id }, (err, servicedata) => {
                                        if(err){
                                          res.send(commonData.responseJSON(500, 'Error!', err));
                                        }else{
                                          servicerequest.find({ service_id: { $in: servicedata } })
                                          .populate('user_id', '-password -token -type -_id').populate('service_id')
                                          .exec((err,serviceReqData) => {
                                              if(err){
                                                res.send(commonData.responseJSON(500, 'Error!', err));
                                              }
                                              else{
                                                  var objData = {token: NewToken, ServiceRequest: serviceReqData};
                                                  res.send(commonData.responseJSON(200, 'Welcome Admin', objData));
                                              }
                                          });
                                        }
                                    });
                                    }
                              }
                            });
                    }
                    else{
                      res.send(commonData.responseJSON(500, 'Error! Password is Incorrect'));
                    }
                    }
                });

             }
        
           });
          }
}

exports.updateUser = (req, res) => {
  usermodel.findOne({token: req.headers.token}, (err,userData) => {
      if(err){
        res.send('error');
      }else{
       var username = userData.username;
       var email = userData.email;
        if(req.body.username){
          username = req.body.username;
        }
        if(req.body.email){
          email = req.body.email;
        }
        usermodel.findOneAndUpdate({ token: req.headers.token },{ $set: { username: username, email: email} },
          { runValidators: true, new: true, fields: { 'username':1, 'email':1 } },(err, updateData) => {
              if(err){
                  console.log(err);
                  res.send(commonData.responseJSON(500,'Failed',err.message));
              }else{
                  res.send(commonData.responseJSON(200, 'User Updated Successfully', updateData));
              }
          });

      }
  
  });

}
exports.logOut = (req, res) =>{
  if(req.headers.token){
    usermodel.findOneAndUpdate({ token: req.headers.token },{ $set: { token: '' } },{ new: true },
         (err, logoutUser) => {
            if (err || !logoutUser) {
                res.send(commonData.responseJSON(400,'Failed','Invalid Token'));
            } else {
                res.send(commonData.responseJSON(200, 'User Logged Out Successfully', logoutUser));
            }
        });
}else{
    res.send(commonData.responseJSON(404,'Not Found','User already Logged Out!'));
}

}

exports.deleteUser = (req, res) => {
if(req.headers.token){
   usermodel.findOne({ token: req.headers.token }).exec((err, result) => {
      if(err){
        res.send(commonData.responseJSON(500,'server error!', err));
      }
      else{
        // console.log(result);
        if(result.type == 'user'){
                servicerequest.find({user_id: { $in: result._id }, status: 'Accepted' }, (err, statusData) => {
                    if (!statusData.length) {
                        servicerequest.find({ user_id: { $in: result._id } }, { _id: 1 }, (err, serReqArr) => {
                            if (err) {
                              res.send(commonData.responseJSON(500,'server error!', err));
                            } else {
                                console.log('requstArray' + serReqArr);
                                servicerequest.deleteMany({_id: { $in: serReqArr } }, (err, deleteRequest) => {
                                    if (err) {
                                      res.send(commonData.responseJSON(404,'server error!', err));
                                    } else {
                                        console.log(deleteRequest);
                                        comment.deleteMany({service_req_id: { $in: serReqArr } }, (err, deleteComments) => {
                                            if (err) {
                                              res.send(commonData.responseJSON(404,'server error!', err));    
                                            } else {
                                                console.log(deleteComments);
                                                        usermodel.deleteMany({_id: result._id }, (err, deleteUser) => {
                                                            if (err) {
                                                              res.send(commonData.responseJSON(404,'server error!', err));                                                                
                                                            } else {
                                                                console.log(deleteUser);
                                                                res.send(commonData.responseJSON(200,'User Deleted Successfully'));
                                                            }
                                                        });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        console.log(statusData);
                        res.send(commonData.responseJSON(500,'Request Accepted! User Can not be deleted'));
                    }
                });
    }
    else if(result && result.type == 'admin'){
        service.find({provider_id: result._id }, { _id: 1 }, (err, serviceData) => {
            if (err) {
              res.send(commonData.responseJSON(404,'server error!', err));  
            } else {
                console.log(serviceData);
                servicerequest.find({ service_id: { $in: serviceData }, status: 'Accepted' }, (err, statusData) => {
                    if (!statusData.length) {
                        servicerequest.find({ service_id: { $in: serviceData } }, { _id: 1 }, (err, serReqArr) => {
                            if (err) {
                              res.send(commonData.responseJSON(404,'server error!', err));  
                            } else {
                                servicerequest.deleteMany({ _id: { $in: serReqArr } }, (err, deleteRequest) => {
                                    if (err) {
                                      res.send(commonData.responseJSON(404,'server error!', err));
                                    } else {
                                        console.log(deleteRequest);
                                        comment.deleteMany({ service_req_id: { $in: serReqArr } }, (err, deleteComments) => {
                                            if (err) {
                                              res.send(commonData.responseJSON(404,'server error!', err));
                                            } else {
                                                console.log(deleteComments);
                                                service.deleteMany({ provider_id: result._id }, (err, deleteServices) => {
                                                    if (err) {
                                                      res.send(commonData.responseJSON(404,'server error!', err));
                                                    } else {
                                                        console.log(deleteServices);
                                                        usermodel.deleteMany({_id: result._id }, (err, deleteUser) => {
                                                            if (err) {
                                                              res.send(commonData.responseJSON(404,'server error!', err));                                                                
                                                            } else {
                                                                console.log(deleteUser);
                                                                res.send(commonData.responseJSON(200,'Success! User Deleted'));                                                                
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    } else {
                        console.log(statusData);
                        res.send(commonData.responseJSON(500,'Request Accepted! User Can not be deleted'));
                    }
                })
            }
        });
  }
      }
   });
  }
  else{
    res.send(commonData.responseJSON(500,'you are not login'));
  }

}
