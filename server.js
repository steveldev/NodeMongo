const app = require('express')()
const mongodb =  require('mongodb')
const MongoClient = mongodb.MongoClient
const bodyParser = require('body-parser')

const appUrl = 'http://localhost'
const appPort = 8080
const databaseUrl = 'mongodb://localhost:27017'

// moteur de template
app.set('view engine', 'ejs')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

// connexion à la base de donnée
MongoClient.connect(databaseUrl, (err, client) => {
    if(err) throw err
    const db = client.db('tuto')
    const collectionName = 'products'
    const collection = db.collection(collectionName)

    // READ (all)
    app.get('/', (req, res) => {
        //response.send('Salut')
        collection.find().toArray((err, data) => {
            if (err) throw err;
            res.render('index', {products: data, collectionName: collectionName})
        });
    })

    // CREATE
    app.post('/products/post', (req, res) => {        
        collection.insertOne(req.body, (err, product) => {
            if (err) throw err;
            var flash = {'success' : 'Enregistrement terminé (POST) '}
            console.log("Enregistrement terminé ")
            res.redirect('/')       
        })
    })

    // READ (vue id)
    app.get('/products/:id', (req, res) => {
        var id = new mongodb.ObjectId(req.params.id)
        collection.findOne({"_id": id}, (err, product) => {
            if (err) throw err;
            console.log("Affichage de l'enregistrement : " + id)
            res.render('index', {product: product, collectionName: collectionName})
        })
    })

    // UPDATE
    // replace to app.put
    app.post('/products/edit/:id', (req, res) => { 
        var id = new mongodb.ObjectId(req.params.id)
        var query = { "_id": id }
      
        var data = req.body
        data._id = id

        collection.replaceOne(query, data, (err, product) => {
            if (err) throw err;
            var flash = {'success' : 'Enregistrement terminé (update)'}
            console.log("Enregistrement terminé (PUT) : " + query._id)
            res.redirect('/')
        })           
    })

    // DELETE
    // replace to app.delete
    app.get('/products/delete/:id', (req, res) => {   
        collection.deleteOne({"_id": new mongodb.ObjectId(req.params.id)}, (err, data) => {
            if (err) throw err;
            var flash = {'success' : 'Enregistrement supprimé'}
            console.log("Enregistrement supprimé (DELETE) : " + req.params.id)
            res.redirect('/')
        })
    })
    
    // COPY
    app.get('/products/copy/:id', (req, res) => {  

        var id = new mongodb.ObjectId(req.params.id)
        collection.findOne({"_id": id}, (err, product) => {
            if (err) throw err;
            product._id = new mongodb.ObjectId()
            collection.insertOne(product, (err, product) => {
                if (err) throw err;
                var flash = {'success' : 'Enregistrement terminé (copy) : ' + id}
                console.log("Enregistrement terminé (COPY) : " + id)
                res.redirect('/')       
            })           
        })            
    })


})

// lance le serveur 
app.listen(appPort, () => {
    console.log('--------------------------------------------')
    console.log('Server started : ' + appUrl + ':' + appPort)
    console.log('--------------------------------------------')
})
