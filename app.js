import express from 'express';
const app=express();
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import base64 from 'base-64'
import { v4 as uuidv4 } from 'uuid';

const username='iNd3jDMYRKsN1pjQPMRz2nrq7N99q4Tsp9EY9cM0';
const password='Ne5DoTQt7p8qrgkPdtenTK8zd6MorcCR5vXZIJNfJwvfafZfcOs4reyasVYddTyXCz9hcL5FGGIVxw3q02ibnBLhblivqQTp4BIC93LZHj4OppuHQUzwugcYu7TIC5H1';
const url='https://demo.credy.in/api/v1/maya/movies/';

let collections=[]

const map=new Map();

app.use(bodyParser.json());

app.get('/movies',verifyToken,(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
            let headers=new Headers();
            headers.append('Authorization', 'Basic ' + base64.encode(username + ":" + password));
            fetch(url,{method:'GET',
        headers:headers,})
        .then(response=>response.json())
        .then(json=>res.send(json));

        }
    });
});

const registerUser=(req,res)=>{
    const user=req.body;
    //console.log(user);
    jwt.sign({user},'secret-key',(err,token)=>{
        res.send({
            access_token: token
        });
    });
}

app.post('/register',registerUser);

app.post('/collection',(req,res)=>{
    const collection=req.body;
    const collection_uuid=uuidv4();
    collections.push({
        ...collection,
        collection_uuid:collection_uuid
    });
    const movies=collection.movies;
    movies.forEach(movie => {
        if(map.has(movie.genres)){
            map.set(movie.genres,map.get(movie.genres)+1);
        }else {
            map.set(movie.genres,1);
        }
    });
    res.send({collection_uuid});
});

app.get('/collection',(req,res)=>{
    const ar=[];
    for(const [key,value] of map.entries()){
        ar.push({key,value});
    }
    ar.sort((a,b)=>b.value-a.value);
    const favourite_genres=[];
    if(ar.length>0)favourite_genres.push(ar[0].key);
    if(ar.length>1)favourite_genres.push(ar[1].key);
    if(ar.length>2)favourite_genres.push(ar[2].key);
    res.send({
        is_success:true,
        data:{
            collections,
            favourite_genres
        }
    });
});

app.get('/collection/:id',(req,res)=>{
    const {id}=req.params;
    res.send(collections.find((collection)=>collection.collection_uuid===id));
});

app.delete('/collection/:id',(req,res)=>{
    const {id}=req.params;
    collections=collections.filter((collection)=>collection.collection_uuid!=id);
    res.send(collections);
});

app.patch('/collection/:id',(req,res)=>{
    const {id}=req.params;
    const {title,description,movies}=req.body;
    const collection=collections.find((collection)=>collection.collection_uuid===id);
    if(title)collection.title=title;
    if(description)collection.description=description;
    if(movies)collection.movies=movies;

    res.send(`collection ${id} is updated`);
});

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