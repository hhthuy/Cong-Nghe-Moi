
const express = require("express");
const app = express();

app.use(express.json({ extended: false }));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');
//connect DynamoDB
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIAY5XCFSBPZ4MMAAYX',
    secretAccessKey:'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',
    region:'ap-southeast-1'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'BaiBao';

const multer = require('multer');
const upload = multer();

app.get('/add', async(req, res) => {
    res.render('add');
});

//load
app.get('/', (request, response) => {
    //query database
    const params ={
        TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
        if(err){
            console.log('Lỗi: Get data', err);
        }else{
            console.log('data= ' + JSON.stringify(data));
            return response.render('index', {baiBaos: data.Items});
        }
    });
});
//add -POST/PUT
app.post('/', upload.fields([]), (req, res)=>{
    const {ma_bao, ten_bao, ten_tacgia, isbn, so_trang, nam_xb,image}=req.body;
    const params ={
        TableName: tableName,
        Item:{
            "ma_bao":ma_bao,
            "ten_bao": ten_bao,
            "ten_tacgia": ten_tacgia,
            "isbn":isbn,
            "so_trang": so_trang,
            "nam_xb": nam_xb,
            "image":image
        }
    }
    docClient.put(params,(err, data) =>{
        if(err){
            console.log('Loi Post -Add');
            console.log(err);
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
                "ma_bao": listItems[index]
            }
        }
    docClient.delete(params, (err, data) => {
        if(err){
            console.log('Lỗi: Post - Delete');
            console.log(err);
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
app.listen(3000,() =>{
        console.log('App listening on port 3000!')
});