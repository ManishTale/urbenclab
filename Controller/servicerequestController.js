const usermodel = require('../Module/userModel');
const servicerequest = require('../Module/service_reqModel');
const service = require('../Module/serviceModel');  
const comment = require('../Module/commentsModel');
const commonData = require('../common');
exports.createRequest = (req, res) => {
    if(!req.body.serviceid || !req.body.details){
        res.status(400).json({ success: false, message: 'Please Fill All the Field' });
}
else{
            usermodel.findOne({token: req.headers.token}, (err, data) => {
                if(err || !data){
                    res.status(400).json({ success: false, message: 'Error! User Not Found' });
                }else{

                    if(data && data.type == 'user'){
                        ServiceReq = new servicerequest();
                        ServiceReq.service_id = req.body.serviceid;
                        ServiceReq.user_id = data._id;
                        ServiceReq.details = req.body.details;
                        ServiceReq.status = 'Pending';
                        ServiceReq.save((err, result) => {
                            
                        if(err){
                            res.status(400).json({ success: false, message: 'Error! To save Request', err });
                        }
                        else{
                            res.status(200).json({ success: true, message: 'Success! Request Saved Successfully', result });
                        }
                });
            }
            else{
                res.status(400).json({ success: false, message: 'Error! You are not a user' });
            }
                }
        
            });
       
        }

}

exports.deleteRequest = (req, res) => {
    if(req.headers.token){
        usermodel.findOne({token:req.headers.token}, (err, user) => {
            if(err){
                console.log(err);
                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
            }else{
                if(user && user.type == 'user'){
                    servicerequest.findOneAndDelete({_id:req.params.id, user_id: user._id }, (err, serviceReq) => {
                        if(err || !serviceReq || serviceReq.status == 'Accepted'){
                            console.log(err);
                            res.send(commonData.responseJSON(400,'Failed','Request is in use or You are not Authorized to Delete it'));
                        }else{
                            comment.deleteMany({service_req_id: serviceReq._id}, (err, comment) => {
                                if(err){
                                    console.log(err);
                                    res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                                }else{
                                    console.log(comment);
                                    res.send(commonData.responseJSON(200,'Request Deleted Successfully',serviceReq));
                                }
                            });
                        }
                    });
                }else{
                    res.send(commonData.responseJSON(404,'Invalid','Invalid User'));
                }
            }
        });
    
}else{
    res.send(commonData.responseJSON(400,'Invalid','User not Logged in'));
}
}
exports.getuserRequest = (req, res) => {

    if(req.headers.token){
        usermodel.findOne({token:req.headers.token}, (err,user) => {
            if(err){
                console.log(err);
                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
            }else{
                if(user && user.type == 'user'){
                    if(req.headers.filter){
                        servicerequest.find({ user_id: user._id, status: req.headers.filter}).populate('service_id').exec((err,serviceReqs) => {
                            if(err){
                                console.log(err);
                                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                            }else{
                                res.send(commonData.responseJSON(200,'Success',serviceReqs));
                            }
                        });
                    }else{
                        servicerequest.find({user_id: user._id}).populate('service_id').exec((err,serviceReqs) => {
                            if(err){
                                console.log(err);
                                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                            }else{
                                res.send(commonData.responseJSON(200,'Success',serviceReqs));
                            }
                        });
                    }
                }else if(user && user.type == 'admin'){
                    service.find({provider_id: user._id}, '_id' , (err, services) => {
                        if(err){
                            console.log(err);
                            res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                        }else{
                            if(req.headers.filter){
                                servicerequest.find({ service_id: { $in: services }, status: req.headers.filter })
                                .populate('user_id','-password -token -type -_id').populate('service_id').exec((err, serviceReqs) => {
                                    if(err){
                                        console.log(err);
                                        res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                                    }else{
                                        res.send(commonData.responseJSON(200,'Success',serviceReqs));
                                    }
                                });
                            }else{
                                servicerequest.find({ service_id: { $in: services }}).populate('user_id','-password -token -type -_id')
                                .populate('service_id').exec((err, serviceReqs) => {
                                    if(err){
                                        console.log(err);
                                        res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                                    }else{
                                        res.send(commonData.responseJSON(200,'Success',serviceReqs));
                                    }
                                });
                            }
                        }
                    });
                }else{
                    res.send(commonData.responseJSON(400,'Invalid','Invalid User'));
                }
            }
        });
    }else{
        res.send(commonData.responseJSON(400,'Invalid','User not Logged in'));
    }
}

exports.updateRequestStatus = (req, res) => {
    if(req.headers.token){
        usermodel.findOne({token: req.headers.token}, (err,user) => {
            if(err){
                console.log(err);
                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
            }else{
                if(user && user.type == 'admin'){
                    if(req.body.status){
                        servicerequest.findOne({_id:req.params.id}).populate('service_id').exec((err,serviceReq) => {
                            if(err){
                                console.log(err);
                                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                            }else{
                                if( serviceReq.service_id.provider_id.equals(user._id) ){
                                    if(serviceReq.status == 'Accepted' && req.body.status !== 'Completed'){
                                        res.send(commonData.responseJSON(400,'Invalid Operation','Service Request can only be completed once Accepted'));
                                     }else if(serviceReq.status == 'Completed'){
                                        res.send(commonData.responseJSON(400,'Invalid Operation','Service Request is Already Completed'));
                                     }
                                    else{
                                        servicerequest.findOneAndUpdate({ _id: serviceReq._id },{ $set: { status: req.body.status }},{ new: true },
                                            (err, newServiceReq) => {
                                                res.send(commonData.responseJSON(200,'Successfully changed the status of request',newServiceReq));
                                            });
                                    }
                                }else{
                                    res.send(commonData.responseJSON(400,'Invalid','Invalid User'));
                                }
                            }
                        });
                    }else{
                        res.send(commonData.responseJSON(400,'Not Found','Status not Found'));
                    }
                }else{
                    res.json(commonData.responseJSON(400,'Invalid','Invalid User'));
                }
            }
        });
    }else{
        res.json(commonData.responseJSON(400,'Invalid','User not Logged in'));
    }
}






