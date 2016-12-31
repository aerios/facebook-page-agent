var Request = require("request")
var underscore = require("underscore")
var format 			= require("util").format
var ThrottleEngine 	= require("throttle-exec")
var Promise 		= require("bluebird")
var ThrottleInstance= new ThrottleEngine(10)

var API_VERSION = "v2.6"
var API_URL = "https://graph.facebook.com"

function getURI(path){
	return [
		API_URL,
		API_VERSION,
		path
	].join("/")
};
function FacebookPageAgent(token){
	this._token = token;
};

var FacebookPageAgentPrototype = {
	get 	: function(path,param){
		return this._get(this._token,path,param)
	},
	post 	: function(path,param){
		return this._post(this._token,path,param)
	},
	_get : ThrottleInstance.wrap(function(token,path,param){
		return new Promise(function(resolve,reject){
			var realParam = underscore.defaults({},param,{access_token : token})
			var uriEndpoint = getURI(path)
			// console.log(realParam)
			Request({
				url 	: uriEndpoint,
				qs 		: realParam,
				json 	: true,
				method 	: "GET"
			},function(err,response,data){
				if(err)return reject(err)
				else return resolve(data)
			})	
		})		
	}),
	_post : ThrottleInstance.wrap(function(token,path,param){
		return new Promise(function(resolve,reject){
			var realParam = underscore.defaults({},param,{access_token : token})
			var uriEndpoint = getURI(path)
			Request({
				url 	: uriEndpoint,
				form 	: realParam,				
				method 	: "POST"
			},function(err,response,data){
				if(err)return reject(err)
				else return resolve(JSON.parse(data))
			})		
		})		
	})
}

underscore.extend(FacebookPageAgent.prototype,FacebookPageAgentPrototype)
module.exports = FacebookPageAgent
