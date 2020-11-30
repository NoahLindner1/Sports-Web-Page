'use strict'

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');
const handlebars = require('express-handlebars').create({defaultLayout : 'main'});

const app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const pathToGameData = path.join(__dirname, 'data', 'data.json');

app.get('/', async (req,res) => {
	try{
		const data = await readFile(pathToGameData);
		const games = data.Games;

		res.render('allGames',{games:games});
	}
	catch(err){
		res.status(500);
	}
});

app.post("/searchLocation", async (req,res) => {
	try{
		const data = await readFile(pathToGameData);
		const gameLocation = req.body.location;
		const games = data.Games.filter((game) => {
			if(game.gameLocation === gameLocation){
				return true;
			}
		});
		res.json(games);
	}
	catch(err){
		console.log(err);
	}
});

app.get("/search/gameLocation", async (req,res) => {
	res.render("searchLocation");
});

app.post("/searchName", async (req,res) => {
	try{
	const data = await readFile(pathToGameData);
	const teamName = req.body.name;
	const games = data.Games.filter((game) => {
		if (game.team1.team === teamName || game.team2.team === teamName) {
			return true;
		}
	});
	res.json(games);
}
catch(err) {
	console.log(err);
}
});

app.get("/search/name", async (req, res) => {
	res.render("nameSearch");
});

app.post("/searchDate", async (req,res) => {
	try{
		const data = await readFile(pathToGameData);
		const gameDate = req.body.date
		const games = data.Games.filter((game) => {
			if (game.gameDate === gameDate) {
				return true;
			}
		});
		res.json(games);
	}
	catch(err){
		console.log(err);
	}
});

app.get("/search/date", async (req, res) => {
	res.render("dateSearch");
});



app.post('/games', async (req,res) => {
	try{
		const data = await readFile(pathToGameData);
		const HomeTeam = req.body.team1.team;
		const HomeTeamScore = req.body.team1.score;
		const VisitingTeam =  req.body.team2.team;
		const VisitingTeamScore =  req.body.team2.score;
		const GameDate = req.body.gameDate;
		const GameLocation = req.body.gameLocation;
		
		const newGame = {
			team1 : {
				team: HomeTeam,
				score: HomeTeamScore
			},
			team2 : {
				team: VisitingTeam,
				score: VisitingTeamScore
			},
			gameDate: GameDate,
			gameLocation: GameLocation
		};

		data.Games.push(newGame);
		await writeFile(pathToGameData, data);
		let games = data.Games;
		res.json(games);
	}
	catch(err){
		res.status(500);
	}

});

app.use((req, res) => {
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`);
});

app.listen(53140, () => console.log('The server is up and running...'));

function readFile(jsonFilePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
            if(err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function writeFile(jsonFilePath,jsData){
	return new Promise((resolve,reject) =>{
		const jsonString = JSON.stringify(jsData);
		fs.writeFile(jsonFilePath,jsonString, (err) => {
			if(err){
				reject(err);
			}
			else{
				resolve();
			}
		});
	});
}
