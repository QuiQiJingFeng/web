
function btnCommitClicked(action){
    var account = $('#input_account').val();
    var password = $('#input_password').val();
    if(account ==  null || account == '' || password ==  null || password == ''){
        alert("account or password must not null");
        return;
    }
    $.ajax({
        type: 'POST',
        url: action,
        data: {
            account:account,
            password:password
        },
        success: function(result){
            //只要赋给 location 对象一个新值，文档就会使用新的 URL 加载
            window.location = "/";
        }
    });
}