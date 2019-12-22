function valPwd(v){
    var r=/^[a-zA-Z0-9'-''_']{3,15}$/;
    return r.test(v);
}
$("#acipt").blur(function(){
 if(!valPwd($("#acipt").val())){
    $("#acinfo").text("账号格式错误!").css("color","red");
    $("#acipt").val("");
}
else{
 $("#acinfo").text("账号合法").css("color","green");
}
});
$("#pwdipt").blur(function(){
    if(!valPwd($("#pwdipt").val())){
        $("#pwdinfo").text("密码格式错误!").css("color","red");
        $("#pwdipt").val("");
    }
    else{
        $("#pwdinfo").text("密码合法").css("color","green");
    }
});
$(".navitem").click(function(){
    var href = $(this).attr("href");
    $("#navform").attr("action",href).submit();
    return false;
});