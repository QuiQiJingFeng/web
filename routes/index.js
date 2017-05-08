let express = require('express');
let router = express.Router();
var md5 = require('md5');
let mysql_pool = require('./mysql_pool.js');
let COOKIE_TIMEOUT = 36000000;

/* GET home page. */
router.route('/')
    .get(function(req, res) {
        if (req.cookies.login) {
            res.redirect('/index');
        } else {
            res.redirect('/login');
        }
    });

router.route('/logout')
    .post(function(req, res) {
        res.clearCookie('login');
        res.redirect('/login');
    })

    .get(function(req, res) {
        res.clearCookie('login');
        res.redirect('/login');
    });

router.get('/login', function(req, res) {
    //send html
    res.end();
    // res.render('login.jade', {title:'A&M login'});
});

/*
    param1  account
    param2  password
    result
        success   成功
        error   失败
    }
*/
//pos request will process login
router.post('/login', function(req, res) {
     if (req.body.action == 'login') {
        let account = req.body.account;
        let password = req.body.password;
        if (!account || !password || !account.trim() || !password.trim()) return;

        mysql_pool.GetAccount(account, function(value){
            let response = {result : 'error'};
            data = value[0];
            if(data && data.password == md5(password)){
                response.result = 'success';
                res.cookie('login', account, { maxAge: COOKIE_TIMEOUT });
                res.cookie('group', data.group_id);
            }

            res.json(JSON.stringify(response));
            res.end();
        });
    }else{
        res.end();
    }
});

router.post('/register', function(req, res) {
    if (req.body.action == 'register') {
        let account = req.body.account;
        let password = req.body.password;
        if (!account || !password || !account.trim() || !password.trim()) return;
        let response = {};
        mysql_pool.GetAccount(account, function(value){
                data = value[0];
                if(data) {
                    response.result = "account_exist";
                    res.json(JSON.stringify(response));
                    res.end();
                }else {
                    mysql_pool.RegisterAccount(account, md5(password),function(success) {
                        if(success) {
                            response.result = 'success';
                        }else {
                            response.result = "failer";
                        }
                        res.json(JSON.stringify(response));
                        res.end();
                    });
                }
        });
    }else{
        res.end();
    }

})

module.exports = router;
