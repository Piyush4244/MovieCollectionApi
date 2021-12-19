import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import base64 from 'base-64'
import { v4 as uuidv4 } from 'uuid';


const username='iNd3jDMYRKsN1pjQPMRz2nrq7N99q4Tsp9EY9cM0';
const password='Ne5DoTQt7p8qrgkPdtenTK8zd6MorcCR5vXZIJNfJwvfafZfcOs4reyasVYddTyXCz9hcL5FGGIVxw3q02ibnBLhblivqQTp4BIC93LZHj4OppuHQUzwugcYu7TIC5H1';
const url='https://demo.credy.in/api/v1/maya/movies/';

let collections=[]

const map=new Map();

export const registerUser=(req,res)=>{
    const user=req.body;
    //console.log(user);
    jwt.sign({user},'secret-key',(err,token)=>{
        res.send({
            access_token: token
        });
    });
}

export const getMovies=(req,res)=>{
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
}

export const postCollection=(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
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
        }
    });
}

export const getCollections=(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
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
        }
    });
}

export const getCollectionbyId=(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
            const {id}=req.params;
            const collection=collections.find((collection)=>collection.collection_uuid===id);
            if(!collection)res.send('no collection found');
            else res.send(collection);
        }
    });
}

export const deleteCollection=(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
            const {id}=req.params;
            collections=collections.filter((collection)=>collection.collection_uuid!=id);
            res.send(collections);
        }
    });
}

export const updateCollection=(req,res)=>{
    jwt.verify(req.token,'secret-key',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else {
            const {id}=req.params;
            const {title,description,movies}=req.body;
            const collection=collections.find((collection)=>collection.collection_uuid===id);
            if(!collection)res.send('No collection found');
            else {
                if(title)collection.title=title;
                if(description)collection.description=description;
                if(movies)collection.movies=movies;
                res.send(collection);
            }
        }
    });
}