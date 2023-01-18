const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

var db;

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://guntak:asdrt20@cluster0.iclbkyd.mongodb.net/test', function(err, client){
    if(err){return console.log(err)}

    db = client.db('todoapp');

    app.listen(8080, function (){
        console.log('listening on 8080')
    });
})

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname+'/write.html');
});

app.post('/add', (req, res) => {
    db.collection('counter').findOne({name:'게시물 갯수'}, function(err, result){
        console.log(result.totalPost)
        var total = result.totalPost
        db.collection('post').insertOne({_id : total+1, 제목 : req.body.title, 날짜 : req.body.date}, function(err, res){
            console.log('저장완료');
            db.collection('counter').updateOne({name : '게시물 갯수'},{$inc : {totalPost : 1}},function(){})
        });
    });
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function(err, result){
        console.log(result);
        res.render('list.ejs', {posts : result})
    })
})

app.delete('/delete', function(req, res){
    req.body._id = parseInt(req.body._id)
    db.collection('post').deleteOne(req.body,function(err, result){
        console.log('이거 실행하니?')
        if(err){return err}
        res.status(200).send({msg : 'success'});
    })
})

app.get('/detail/:id',function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)},function(err, result){
        if(err){res.status(404).send({msg : '그런거 없어요!'})}
        console.log(result)
        res.render('detail.ejs', {data : result})
    })
})


//렌더링
app.get('/edit/:id',function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)},function(err, result){
        if(err){res.status(404).send({msg : '그런거 없어요!'})}
        res.render('edit.ejs', {data : result})
    })
})


//수정 값
app.post('/edit/:id', function(req, res) { 
    db.collection('post').updateOne({_id : parseInt(req.params.id)}, {$set : {제목 : req.body.title, 날짜 : req.body.date}}, function(err, result) {
        res.redirect('/list');
    })
})