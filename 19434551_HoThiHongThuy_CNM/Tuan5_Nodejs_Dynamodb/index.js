require('dotenv').config({path: __dirname + '/.env'});
const express = require("express");
const app = express();

app.use(express.json({ extended: false }));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');

// config aws dynamodb
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIAY5XCFSBPZ4MMAAYX',
    secretAccessKey:'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',
    region:'ap-southeast-1'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName ='SanPham';

const multer = require('multer');
const upload = multer();

app.get('/', (request, response) => {
    //query database
    const params ={
        TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
        if(err){
            response.send('Internal Server Error');
        }else{
            return response.render('index', {sanPhams: data.Items});
        }
    });
});

//add
app.post('/', upload.fields([]), (req, res) => {
    const{ma_sp, ten_sp, so_luong} = req.body;
    const params = {
        TableName: tableName,
        Item: {
            "ma_sp": ma_sp,
            "ten_sp": ten_sp,
            "so_luong": so_luong
        }
    }
    docClient.put(params, (err, data) => {
        if(err){
            return res.send('Internal Server Error')
        }else{
            return res.redirect("/");
        }
    })
});
//delete
app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);
    if(listItems.length === 0){
        return res.redirect("/")
    }
    function onDeleteItem(index){
        const params = {
            TableName: tableName,
            Key:{
                "ma_sp": listItems[index]
            }
        }
    docClient.delete(params, (err, data) => {
        if(err){
            return res.send('Internal Server Error')
        }else{
            if(index > 0){
                onDeleteItem(index - 1);
            }else{
                return res.redirect("/");
            }
            
        }
    })
}
    onDeleteItem(listItems.length - 1);
});

app.listen(3000, () => {
    console.log(`Example app listening on port 3000!`)
})