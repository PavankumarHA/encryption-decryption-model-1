var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var con = require('../conn/dbconnection');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.flag == 1){
    req.session.destroy();
    res.render('index', { title: 'CodeLanguage', message : 'Email Already Exists' , flag : 1}); // if email already exit then register different mail
  }
  else if(req.session.flag == 2){
    req.session.destroy();
    res.render('index', { title: 'CodeLanguage', message : 'Registration Done. Please Login.', flag : 0});    // if registration successfull then log in
  }
  else if(req.session.flag == 3){
    req.session.destroy();
    res.render('index', { title: 'CodeLanguage', message : 'Confirm Password Does Not Match.', flag : 1});  // if confirm psw not match
  }
  else if(req.session.flag == 4){
    req.session.destroy();
    res.render('index', { title: 'CodeLanguage', message : 'Incorrect Email or Password.', flag : 1 });   // if entered incorrect email or password
  }
  else{
    res.render('index', { title: 'CodeLanguage' });
  }
   
});

//Handle POST request for User Registration
router.post('/auth_reg', function(req, res, next){

  var fullname = req.body.fullname;
  var email = req.body.email;                           // user registration form 
  var password = req.body.password;
  var cpassword = req.body.cpassword;

  if(cpassword == password){        

    var sql = 'select * from users where email = ?;';

    con.query(sql,[email], function(err, result, fields){
      if(err) throw err;

      if(result.length > 0){
        req.session.flag = 1;   //  before registration checking the email if existing or not   res.render('index', { title: 'CodeLanguage', message : 'Email Already Exists' , flag : 1});
        res.redirect('/');
      }else{

        var hashpassword = bcrypt.hashSync(password, 10);
        var sql = 'insert into users(name,email,password) values(?,?,?);';

        con.query(sql,[fullname,email, hashpassword], function(err, result, fields){
          if(err) throw err;
          req.session.flag = 2;   // if registration is successfull    else if(req.session.flag == 2){ //  res.render('index', { title: 'CodeLanguage', message : 'Registration Done. Please Login.', flag : 0});  
          res.redirect('/');
        });
      }
    });
  }else{
    req.session.flag = 3;   // else confirm password does not match //   else if(req.session.flag == 3){  //   res.render('index', { title: 'CodeLanguage', message : 'Confirm Password Does Not Match.', flag : 1});
    res.redirect('/');
  }
});


//Handle POST request for User Login
router.post('/auth_login', function(req,res,next){        // user login through email and password

  var email = req.body.email;
  var password =req.body.password;

  var sql = 'select * from users where email = ?;';

  con.query(sql,[email], function(err,result, fields){
    if(err) throw err;

    if(result.length && bcrypt.compareSync(password, result[0].password)){  //  comapresync is comapring the password existing psw and login psw right or not
      req.session.email = email;
      res.redirect('/home');
    }else{
      req.session.flag = 4;       //if user entered incorrect email or mail we are calling here error msg res.render('index', { title: 'CodeLanguage', message : 'Incorrect Email or Password.', flag : 1 }); 

      res.redirect('/');
    }
  });
});


router.delete('/delete/:id', (req,res)=>{
  let id = req.params.id;
  con.query("DELETE from users where id = "+id,(err,result)=>{
      if(err){
         throw err;
      }else{
          res.send(result);
      }     
  })
})




//Route For Home Page
router.get('/home', function(req, res, next){
  res.render('home', {message : 'Welcome, ' + req.session.email});
});

router.get('/logout', function(req, res, next){
  if(req.session.email){
    req.session.destroy();
    res.redirect('/');
  }
})

module.exports = router;
