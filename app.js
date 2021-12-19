import express from 'express';
const app=express();
import bodyParser from 'body-parser';

import {registerUser,getMovies, postCollection, getCollections, getCollectionbyId, deleteCollection, updateCollection} from './controllers/movieCollection.js';

app.use(bodyParser.json());

app.get('/movies',verifyToken,getMovies);

app.post('/register',registerUser);

app.post('/collection',verifyToken,postCollection);

app.get('/collection',verifyToken,getCollections);

app.get('/collection/:id',verifyToken,getCollectionbyId);

app.delete('/collection/:id',verifyToken,deleteCollection);

app.patch('/collection/:id',verifyToken,updateCollection);

function verifyToken(req,res,next){
    const tokenToVerify=req.headers['authorization'];
    if(typeof tokenToVerify!=='undefined'){
        req.token=tokenToVerify;
        next();
    }else {
        res.sendStatus(403);
    }
}

app.listen(8000,()=>{console.log('server is running at port 8000')});