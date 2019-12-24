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

$(".getToPost").click(function(){
    var href = $(this).attr("href");
    $("#navform").attr("action",href).submit();
    return false;
});

$('#addbt').click(function(){
    $('#add').prop("hidden",false);
    $('#add').css('background-color','rgba(66,66,66,0.7)');
    $('#addpage').prop("hidden",false);
});

$('#add_exit').click(function(){
    $('.addipt').val("");
    $('#status').val(0);
    $('#add').prop("hidden",true);
    $('#addpage').prop("hidden",true);
});

$(".adminoperate").click(function(){
    var href = $(this).attr("href");
    $("#adminoperate").attr("action",href).submit();
    return false;
});

$('.edibt').click(function(){
    $('#edi').prop("hidden",false);
    $('#edi').css('background-color','rgba(66,66,66,0.7)');
    $('#edipage').prop("hidden",false);
    $("#edi_ac").val($(this).siblings(".operateac").val());
    $("#edi_pwd").val($(this).siblings(".operatepwd").val());
    $("#edi_status").val($(this).siblings(".operatepre").val());
    console.log($(this).siblings(".operatedata"));
});

$('#edi_exit').click(function(){
    $('.addipt').val("");
    $('#edi_status').val(0);
    $('#edi').prop("hidden",true);
    $('#edipage').prop("hidden",true);
});

