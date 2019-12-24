var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var path = require('path');
var type;
var account;
var permission;
var pwd;
var count;
var pc;
var page;
var condition;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine( '.hbs', hbs({
	extname: '.hbs',
	layoutsDir:  __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
}));

// 解析 application/json
app.use(bodyParser.json()); 

// 解析 url编码
app.use(bodyParser.urlencoded({ extended: true }));

//静态文件夹
app.use(express.static('public'));

var connection = mysql.createConnection({      //创建mysql实例
	host:'127.0.0.1',
	port:'3306',
	user:'root',
	password:'',
	database:'server'
});
connection.connect();

//首页
app.get('/', function (req, res) {
	res.render('page',{layout:'index'});
})

//登录
app.post('/login', function (req, res) {
	type = req.body.usertype;
	account = req.body.username;
	pwd = req.body.password;
	var sql = "SELECT * FROM " + type + " where account = '" + account + "'";
	console.log(type);
	if(type == undefined){
		return showMessage("请选择登录类型",res,'/');
	}
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/');
		}
		if(result == ""){
			return showMessage("账号不存在",res,'/');
		}
		var datapwd = result[0].pwd;
		permission = result[0].permission;
		if(datapwd == pwd){
			if(type == "admin"){
				showOrder("",res,1);
			}
			if(type == "user"){
				showOrder(account,res,1);
			}
		}
		else{
			return showMessage("密码错误",res,'/');
		}
	});
})

app.get('/regeister', function (req, res) {
	res.render('page',{layout:'regeister'});
})

app.post('/regeisterdb', function (req, res) {
	sql = "INSERT INTO user (account,pwd,permission) values ('" + req.body.username + "','" + req.body.password + "','0')";
	console.log(sql);
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/regeister');
		}
        return showMessage("注册成功",res,'/');
	});
})

//订单页面
app.get('/order/:id', function (req, res) {
	page = req.params.id;
	if(type == "admin"){
		showOrder("",res,page);
	}
	if(type == "user"){
		showOrder(account,res,page);
	}
})

//订单查询
app.post('/ordersearch/:id', function (req, res) {
	condition = req.body.condition;
	queryOrder(req.body.condition,res,req.params.id);
})

//订单查询
app.post('/ordersearchpage/:id', function (req, res) {
	queryOrder(condition,res,req.params.id);
})

//个人信息页面
app.get('/edit', function (req, res) {
	res.render('page',{
		layout:'edit',
		permission:permission,
		account:account,
		pwd:pwd,
		type:type=="admin",
		highpermission:permission == 2
	});
})

//个人信息修改
app.post('/editdb', function (req, res) {
	var newpwd = req.body.userpwd;
	var sql = "UPDATE " + type + " set pwd = '" + newpwd + "' where account = '" + account + "'";
	pwd = newpwd;
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/edit');
		}
		return showMessage("修改成功",res,'/edit');
	});
})

//管理员信息页面
app.get('/adminlist/:id', function (req, res) {
	page = req.params.id;
	sql = "SELECT * FROM admin";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessageNo(err.message,res);
		}
		var pagecount = new Array();
		count = result.length;
		if(count%10 == 0){
			pc = count/10;
		}
		else{
			pc = count/10+1;
		}
		for(var i=1;i<=pc;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'adminlist',
			datas:result.slice(10*(page-1),10*page),
			issearch:false,
			pagecount:pagecount
		});
	});
})

//管理员添加操作
app.post('/addAdmin', function (req, res) {
	sql = "INSERT INTO admin (account,pwd,permission) values ('" + req.body.newAdminAc + "','" + req.body.newAdminPwd + "','" + req.body.newAdminPre + "')";
	console.log(sql);
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/adminlist/1');
		}
        return showMessage("添加成功",res,'/adminlist/1');
	});
})

//管理员查询
app.post('/adminsearch/:id', function (req, res) {
	condition = req.body.condition;
	queryAdmin(req.body.condition,res,req.params.id);
})

app.post('/adminsearchpage/:id', function (req, res) {
	queryAdmin(condition,res,req.params.id);
})

//管理员信息修改
app.post('/editAdmin', function (req, res) {
	var ediid = req.body.newAdminAc;
	var edipwd = req.body.newAdminPwd;
	var edipre = req.body.newAdminPre;
	var sql="update admin set pwd = '" + edipwd + "',permission = '" + edipre + "' where account = '" + ediid + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/adminlist/'+page);
		}
        return showMessage("修改成功",res,'/adminlist/'+page);
	});
})

//管理员信息删除
app.post('/admindel/:id', function (req, res) {
	var delid = req.params.id;
	var sql = "delete from admin where account = '" + delid + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/adminlist/1');
		}
		return showMessage("删除成功",res,'/adminlist/1');
	});
})

//管理员个人信息修改
app.post('/adminlistdb', function (req, res) {
	var newpwd = req.body.userpwd;
	var sql = "UPDATE " + type + " set pwd = '" + newpwd + "' where account = '" + account + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessageNo(err.message,res);
		}
		return showMessageNo("修改成功",res);
	});
})

//用户信息页面
app.get('/userlist/:id', function (req, res) {
	page = req.params.id;
	sql = "SELECT * FROM user";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessageNo(err.message,res);
		}
		var pagecount = new Array();
		count = result.length;
		if(count%10 == 0){
			pc = count/10;
		}
		else{
			pc = count/10+1;
		}
		for(var i=1;i<=pc;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'userlist',
			datas:result.slice(10*(page-1),10*page),
			type:type == "admin",
			highpermission:permission == 2,
			issearch:false,
			pagecount:pagecount
		});
	});
})

//用户添加操作
app.post('/addUser', function (req, res) {
	sql = "INSERT INTO user (account,pwd,permission) values ('" + req.body.newUserAc + "','" + req.body.newUserPwd + "','" + req.body.newUserPre + "')";
	console.log(sql);
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/userlist/1');
		}
        return showMessage("添加成功",res,'/userlist/1');
	});
})

//用户查询
app.post('/usersearch/:id', function (req, res) {
	condition = req.body.condition;
	queryUser(req.body.condition,res,req.params.id);
})

app.post('/usersearchpage/:id', function (req, res) {
	queryUser(condition,res,req.params.id);
})

//用户信息修改
app.post('/editUser', function (req, res) {
	var ediid = req.body.newUserAc;
	var edipwd = req.body.newUserPwd;
	var edipre = req.body.newUserPre;
	var sql="update user set pwd = '" + edipwd + "',permission = '" + edipre + "' where account = '" + ediid + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/userlist/'+page);
		}
        return showMessage("修改成功",res,'/userlist/'+page);
	});
})

//用户信息删除
app.post('/userdel/:id', function (req, res) {
	var delid = req.params.id;
	var sql = "delete from user where account = '" + delid + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/userlist/1');
		}
		return showMessage("删除成功",res,'/userlist/1');
	});
})

//用户个人信息修改
app.post('/userlistdb', function (req, res) {
	var newpwd = req.body.userpwd;
	var sql = "UPDATE " + type + " set pwd = '" + newpwd + "' where account = '" + account + "'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessageNo(err.message,res);
		}
		return showMessageNo("修改成功",res);
	});
})

var server = app.listen(8081, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("应用实例:访问地址为 http://%s:%s", host, port)
})

//提示页面-无跳转
function showMessageNo(message,res){
	var result=`<script>alert("${message}"); location.replace(location.href)</script>`;
	res.send(result)
}

//提示页面-跳转
function showMessage(message,res,str){
	var result=`<script>alert("${message}"); location.replace('${str}')</script>`;
	res.send(result)
}

//查询消费记录
function showOrder(str,res,page){
	var sql;
	if(str == ""){
		sql = "SELECT * FROM orderlist";
	}
	else{
		sql = "SELECT * FROM orderlist where user_id = '" + str + "'";
	}
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/adminlist/1');
		}
		var pagecount = new Array();
		count = result.length;
		if(count%10 == 0){
			pc = count/10;
		}
		else{
			pc = count/10+1;
		}
		for(var i=1;i<=pc;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'orderlist',
			datas:result.slice(10*(page-1),10*page),
			type:type == "admin",
			highpermission:permission == 2,
			pagecount:pagecount,
			issearch:false
		});
	});
}

//查询消费记录
function queryOrder(str,res,page){
	var sql;
	if(type == "admin"){
		sql = "SELECT * FROM orderlist where order_id like '%" + str + "%' or user_id like '%" + str + "%' or item like '%" + str + "%' or price like '%" + str + "%'";
	}
	else{
		sql = "SELECT * FROM (SELECT * FROM orderlist where user_id = '" + account + "') as p where order_id like '%" + str + "%' or user_id like '%" + str + "%' or item like '%" + str + "%' or price like '%" + str + "%'";
	}
	console.log(sql);
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/order/1');
		}
		var pagecount = new Array();
		count = result.length;
		if(count%10 == 0){
			pc = count/10;
		}
		else{
			pc = count/10+1;
		}
		for(var i=1;i<=pc;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'orderlist',
			datas:result.slice(10*(page-1),10*page),
			type:type == "admin",
			highpermission:permission == 2,
			pagecount:pagecount,
			issearch:true,
			condition:str
		});
	});
}

//查询管理员
function queryAdmin(str,res,page){
	var sql;
	sql = "SELECT * FROM admin where account like '%" + str + "%' or pwd like '%" + str + "%' or permission like '%" + str + "%'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/adminlist/1');
		}
		var pagecount = new Array();
		count = result.length;
		if(count%10 == 0){
			pc = count/10;
		}
		else{
			pc = count/10+1;
		}
		for(var i=1;i<=pc;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'adminlist',
			datas:result.slice(10*(page-1),10*page),
			type:type == "admin",
			highpermission:permission == 2,
			pagecount:pagecount,
			issearch:true,
			condition:str
		});
	});
}

//查询用户
function queryUser(str,res,page){
	var sql;
	sql = "SELECT * FROM user where account like '%" + str + "%' or pwd like '%" + str + "%' or permission like '%" + str + "%'";
	connection.query(sql, function (err,result) {
		if(err){
			return showMessage(err.message,res,'/userlist/1');
		}
		var pagecount = new Array();
		count = result.length;
		for(var i=1;i<=count/10+1;i++){
			pagecount[i-1] = i;
		}
		res.render('page',{
			layout:'userlist',
			datas:result.slice(10*(page-1),10*page),
			type:type == "admin",
			highpermission:permission == 2,
			pagecount:pagecount,
			issearch:true,
			condition:str
		});
	});
}