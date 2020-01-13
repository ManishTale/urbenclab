const usermodel = require('../Module/userModel');
const servicerequest = require('../Module/service_reqModel');
const service = require('../Module/serviceModel');  
const comment = require('../Module/commentsModel');
const commonData = require('../common');
exports.createService = (req, res) => {
if(!req.body.name){
    res.json(commonData.responseJSON(400,'Service Name Not be empty'));
}else{
    usermodel.findOne({ token: req.headers.token}, (err, tokenid) => {
        if(err || !tokenid){
            res.json(commonData.responseJSON(400,'Token not found', err));
        }
        else{
            if(tokenid && tokenid.type == 'admin'){
                var name = req.body.name;
                var str = name.toUpperCase();
                var serviceSchema = new service({
                name: str,
                provider_id: tokenid._id
            });
            service(serviceSchema).save((err, serviceData) => {
                if(err){
                    res.json(commonData.responseJSON(400,'server error', err));
                }else{
                    res.json(commonData.responseJSON(200,'Created Service Successfully',serviceData));
                }
    
            });
        }
        else{
            res.json(commonData.responseJSON(400,'You are User, You Can Not Create Service!'));
        }
        }
    });  

}
}

exports.updateService = (req, res) => {
    if(!req.body.name){
        
        res.send(commonData.responseJSON(500,'Service Name Should not be empty'));
}
else{
    usermodel.findOne({token: req.headers.token}, (err, userData) => {
        if(err || !userData){
            res.send(commonData.responseJSON(404,'User not login'));
        }else{
            if(!userData && userData.type != 'admin'){
                res.json(commonData.responseJSON(500,'Invalid User'));
            }
            else{
                var name = req.body.name;
                var serrviceName = name.toUpperCase();
                service.findOneAndUpdate({ _id: req.params.id, provider_id: userData._id },{ $set: { name: serrviceName} },{ runValidators: true, new: true },
                    (err, newService) => {
                        if(err || !newService){
                            console.log(err);
                            res.json(commonData.responseJSON(500,'Error! Not Authorized User To Update Service!',err));
                        }else{
                            res.json(commonData.responseJSON(200,'Service updated Successfully', newService));
                        }
                });
            }
        }
    });
}
}
exports.serviceDelete = (req, res) => {
            usermodel.findOne({ token: req.headers.token }, (err, userData) => {
                if(err){ 
                    res.json(commonData.responseJSON(500,'Service Error!',err));
                }
                else{
                   if(userData.type == 'admin'){
                    service.findOne({_id: req.params.id, provider_id: userData._id}, (err, serviceData) => {
                        if(err || !serviceData){
                            res.send(commonData.responseJSON(400,'Invalid','Invalid User'));
                        }else{
                            servicerequest.find({service_id: serviceData._id, status: 'Accepted'}, (err, serviceReqs) => {
                                if(serviceReqs.length > 0){
                                    res.send(commonData.responseJSON(400,'Failed','One of the Requests still Active'));
                                }else{
                                    servicerequest.find({service_id: serviceData._id}, '_id' , (err,serviceReqsData) => {
                                        comment.deleteMany({service_req_id: { $in: serviceReqsData }}, (err, comments) => {
                                            console.log('Comments Deleted Successfully.', comments);
                                        });
                                        servicerequest.deleteMany({_id: { $in: serviceReqsData }
                                        }, (err, requests) => {
                                            console.log('Service Reqs Deleted Successfully.', requests);
                                        });
                                        service.deleteOne({_id: req.params.id}, (err, service1) => {
                                            res.send(commonData.responseJSON(200,'Service deleted successfully.',service1));
                                        });
                                    });
                                }
                            });
                        }
                    });
                    
                }
                else{
                    res.send(commonData.responseJSON(500,'Can Not Delete Service You Are Not Service Provider '));
                }
                }
            });
        
    


}

exports.getProviderServices = (req, res) => {
    usermodel.findOne({ token: req.headers.token }, (err, result) => {
        if(err){
            res.send(commonData.responseJSON(500,'Error'));
        }
        else{
            if(result.type == 'admin'){
            service.find({ provider_id: result._id }, (err, data) => {
                if(err){
                    res.send(commonData.responseJSON(500,'Error'));
                }else{
                    if(!data){
                        res.send(commonData.responseJSON(200,'No Data Available', data));
                    }
                    else{
                        res.send(commonData.responseJSON(200,'Services', data));
                    }
                }
            });
        }
        else{
            res.send(commonData.responseJSON(200,'Can Not See This Services'));
        }
        }
    });
}

exports.listOfServices = (req, res) => {
    usermodel.findOne({ token: req.headers.token}, (err, data) => {
        if(err){
            res.send(commonData.responseJSON(500,'error'));
        }
        else{ 
            if(data.type == 'user' || !data.token){
            service.find({}).exec((err, result) => {
                if(err){
                    res.send(commonData.responseJSON(500,'Server Error'));
                }
                else{
                    if(result == ""){
                        res.send(commonData.responseJSON(200,'Does Not Contain Any Services', result));
                    }
                    else{
                        res.send(commonData.responseJSON(200, 'Services List', result));
                    }
                    
                }
            });
        }
        else{
            res.send(commonData.responseJSON(500,'Can Not See Service List'));
        }
        }
    });
    
}

