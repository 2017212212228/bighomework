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
	connection.query(sql, function (err,result) {
		if(err){
			console.log('[SELECT ERROR]:',err.message);
			return;
		}
		if(result == ""){
			return showMessage("账号不存在",res);
		}
		var datapwd = result[0].pwd;
		permission = result[0].permission;
		if(datapwd == pwd){
			if(type == "admin"){
				queryOrder("",res,true);
			}
			if(type == "user"){
				queryOrder(account,res,false);
			}
		}
		else{
			return showMessage("密码错误",res);
		}
	});
})

//订单查询
app.post('/order', function (req, res) {
	if(type == "admin"){
		queryOrder("",res,true);
	}
	if(type == "user"){
		queryOrder(account,res,false);
	}
})

//个人信息页面
app.post('/edit', function (req, res) {
	res.render('page',{
		layout:'edit',
		permission:permission,
		account:account,
		pwd:pwd,
		type:type=="admin"
	});
})

//个人信息修改
app.post('/editdb', function (req, res) {
	var newpwd = req.body.userpwd;
	var sql = "UPDATE " + type + " set pwd = '" + newpwd + "' where account = '" + account + "'";
	connection.query(sql, function (err,result) {
		if(err){
			console.log('[UPDATE ERROR] - ',err.message);
			return;
		}
		showMessage("修改成功",res);
	});
})

//管理员信息页面
app.post('/adminlist', function (req, res) {
	sql = "SELECT * FROM admin";
	connection.query(sql, function (err,result) {
		if(err){
			console.log('[SELECT ERROR]:',err.message);
			return;
		}
		res.render('page',{
			layout:'adminlist',
			datas:result,
		});
	});
})

//管理员信息修改
app.post('/adminlistdb', function (req, res) {
	var newpwd = req.body.userpwd;
	var sql = "UPDATE " + type + " set pwd = '" + newpwd + "' where account = '" + ac + "'";
	connection.query(sql, function (err,result) {
		if(err){
			console.log('[UPDATE ERROR] - ',err.message);
			return;
		}
		showMessage("修改成功",res);
	});
})

var server = app.listen(8081, function () {

	var host = server.address().address
	var port = server.address().port
	console.log("应用实例:访问地址为 http://%s:%s", host, port)
})

//提示页面
function showMessage(message,res){
	var result=`<script>alert('${message}');history.back()</script>`;
	res.send(result)
}

//查询消费记录
function queryOrder(str,res,type){
	var sql;
	if(str == ""){
		sql = "SELECT * FROM orderlist";
	}
	else{
		sql = "SELECT * FROM orderlist where user_id = '" + str + "'";
	}
	connection.query(sql, function (err,result) {
		if(err){
			console.log('[SELECT ERROR]:',err.message);
			return;
		}
		res.render('page',{
			layout:'orderlist',
			datas:result,
			type:type
		});
	});
}