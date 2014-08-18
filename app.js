var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;
var assert = require('assert');
var util = require('util');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var db; // Leave DB as global variable.

MongoClient.connect('mongodb://hosay:Snoogan9s@ds059509.mongolab.com:59509/26experiment',function(err, database){
    db = database;
    db.collection('textandstuff', {}, function(err, coll){
        if(err != null){ // If collection doesn't exist
            db.createCollection('textandstuff', function(err, result){
                assert.equal(null, err); // Stop if there's an error.
            }); // Create a collection
        }
        db.ensureIndex('textandstuff',{
            document: 'text'
            }, function(err, indexname){
            assert.equal(null, err);
        });
        app.listen(3000);
    });
});

app.get('/', function(req, res){
    res.sendfile('./views/index.html');
});

app.get('/add', function(req, res){
    res.sendfile('./views/add.html');
});

app.post('/add', function(res, req){
    db.collection('textandstuff').insert({
        document: req.body.newDocument,
        created: new Date()
    }, function(err, result){
        err == null ? res.sendfile('./views/add.html') : res.send('Error: ' + err);
    });
});

app.get('/search', function(req, res){
    res.sendfile('./views/search.html');
});

app.post('.search', function(req, res){
    db.collection('textandstuff').find({
        '$text':{
            '$search': req.body.query
        }
    },
    {
        document: 1,
        created: 1,
        _id: 1,
        textScore:{
            $meta: 'textScore' // $meta new in 2.6; used to get at the text score value in the results of full text search.
        }
    },
    {
        sort: {
            textScore: {
                $meta: 'textScore'
            }
        }
    }).toArray(function(err, items){ // convert results of query to an array and send
        res.send(pageList(items));
    })
});

function pageList(items){
    result = "<html><body><ul>";
    items.forEach(function(item) {
        itemstring = "<li>" + item._id + "<ul><li>" + item.textScore +
            "</li><li>" + item.created + "</li><li>" + item.document +
            "</li></ul></li>";
        result = result + itemstring;
    });
    result = result + "</ul></body></html>";
    return result;
}
