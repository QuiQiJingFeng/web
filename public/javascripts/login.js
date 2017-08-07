
function btnCommitClicked(action){
    var form1 = document.getElementById("form1")
    form1.action = action;
    
    var account = document.getElementById("input_account").value;
    var password = document.getElementById("input_password").value;
    if(account ==  null || account == '' || password ==  null || password == ''){
            alert("account or password must not null");
            return false;
    }
    form1.submit();
    return true;
}