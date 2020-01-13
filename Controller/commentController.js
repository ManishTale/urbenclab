
const usermodel = require('../Module/userModel');
const servicerequest = require('../Module/service_reqModel');
const service = require('../Module/serviceModel');  
const comment = require('../Module/commentsModel');
const commonData = require('../common');
exports.addComment = (req, res) => {
  if(req.headers.token){
    usermodel.findOne({token: req.headers.token}, (err, user) => {
        if(err || !user){
            console.log(err);
            res.send(commonData.responseJSON(400,'Invalid','User not Logged In'));
        }else{
            if(user.type == 'user'){
                servicerequest.findOne({_id: req.body.service_req_id, user_id: user._id, status: 'Accepted'}, (err, ServiceReq) => {
                    if(err || !ServiceReq){
                
                        res.send(commonData.responseJSON(400,'Failed','Cannot add comment - Service Request is Not accepted!'));
                    }else{
                        var newComment = new comment();
                        newComment.comment = req.body.comment;
                        newComment.service_req_id = req.body.service_req_id;
                        newComment.user_id = user._id;
                        newComment.save((err, newComment) => {
                            if(err){
                              
                                res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                            }else{
                                res.send(commonData.responseJSON(200,'Success', newComment));
                            }
                        });
                    }
                });
            }else{
                servicerequest.findOne({_id: req.body.service_req_id, status: 'Accepted'}).populate('service_id').exec((err, ServiceReq) =>{
                    if(err || !ServiceReq){
                        console.log(err);
                        res.send(commonData.responseJSON(400,'Failed',"Can't add comment - Service Request has not been accepted!"));
                    }else{
                        if( ServiceReq.service_id.provider_id == user._id ){
                            var newComment = new commentsModel();
                            newComment.comment = req.body.comment;
                            newComment.service_req_id = req.body.service_req_id;
                            newComment.user_id = user._id;
                            newComment.save((err, newComment) => {
                                if(err){
                                    console.log(err);
                                    res.send(commonData.responseJSON(400,'Failed','Error Occured'));
                                }else{
                                    res.send(commonData.responseJSON(200,'Success',newComment));
                                }
                            });
                        }else{
                            res.send(commonData.responseJSON(400,'Invalid','Invalid User'));
                        }
                    }
                });
            }
        }
    });
}else{
    res.send(commonData.responseJSON(400,'Invalid','User not Logged In'));
}

if(req.headers.token){
    usermodel.findOne({token:req.headers.token},(err,data)=>{
        if(err || !data){
            res.send(commonData.responseJSON(500,'Error! Data Not Found'));
        }
        else{ 
            console.log(data);
            servicerequest.find({_id:req.body.service_request_id}).exec((err,requestData)=>{

            if(requestData.status=='Accepted'){
                var comment=new modelComment({
                    service_request_id:req.body.service_request_id,
                    comment:req.body.comment,
                    user_id:data._id
                });
                comment.save((err,commentData)=>{
                    if(err){
                        res.send(commonData.responseJSON(500,'Error!'));
                    }else{
                        console.log(commentData);

                        res.send(commonData.responseJSON(200,'Comment Added Successfully', commentData));
                    }
                })
            }else{
                res.send(commonData.responseJSON(500,'Comment Not Added Successfully'));
            }
                    
            })
        }
    })        
}else{
    res.send(commonData.responseJSON(500,'User Not Logged in'));
}
}

exports.getComment = (req, res) =>{
  if(req.headers.token){
    usermodel.findOne({token: req.headers.token}, (err, user) => {
        if(user.type == 'user'){
            servicerequest.findOne({_id: req.params.service_req_id, user_id: user._id}, (err, serviceReq) => {
                if(err || !serviceReq){
                    res.send(commonData.responseJSON(400,'Invalid','Not authorized to view Comments For this request!'));
                }else{
                    comment.find({service_req_id: req.params.service_req_id}, (err, comments) => {
                            if(comments == ''){
                                res.send(commonData.responseJSON(404,'Not Found','No comments found for this Service Request'));
                            }else{
                                res.send(commonData.responseJSON(200,'Success',comments));
                            }
                    });
                }
            });
        }else if(user.type == 'admin'){
            servicerequest.findOne({_id: req.params.service_req_id}).populate('service_id').exec((err, serviceReq) => {
                if(err || serviceReq == '' || !serviceReq.service_id.user_id.equals(user._id)){
                    res.send(commonData.responseJSON(400,'Invalid','not authorized to view Comments of this request!'));
                }else{
                    comment.find({service_req_id: req.params.id}, (err, comments) => {
                            if(comments == ''){
                                res.send(commonData.responseJSON(404,'Not Found','No comments found for this Service Request'));
                            }else{
                                res.send(commonData.responseJSON(200,'Success',comments));
                            }
                    });
                }
            });
        }else{
            res.send(commonData.responseJSON(400,'Invalid','Invalid Token'));
        }
    });
}else{
    res.send(commonData.responseJSON(400,'Invalid','User not Logged In'));
}
}
exports.deleteComment = (req, res) => {
  if(req.headers.token){
    usermodel.findOne({token:req.headers.token}, (err, user) => {
        if(err || !user){
            console.log(err);
            res.send(commonData.responseJSON(400,'Invalid','User not Logged In'));
        }else{
                comment.findOneAndDelete({_id:req.params.id, user_id: user._id}, (err, comment) => {
                    if(err || !comment){
                        console.log(err);
                        res.send(commonData.responseJSON(404,'Not Found','Comment Not Found'));
                    }else{
                        res.send(commonData.responseJSON(200,'Comment deleted successfully', comment));
                    }
                });
        }
    });
}else{
    res.send(commonData.responseJSON(400,'Invalid','User not Logged In'));
}
}