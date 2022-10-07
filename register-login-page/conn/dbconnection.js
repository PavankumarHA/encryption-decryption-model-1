const express = require('express');
var mysql = require('mysql');
var con  = mysql.createPool({

  host: "localhost",
  user: "root",
  password: "password",
  database: "employee",
  connectionlimit: 100
});

con.getConnection(function(err, connection) {
    if(err)
  console.log(err)
else
console.log("connected")
});

module.exports =con;