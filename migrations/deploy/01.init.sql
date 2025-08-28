-- Deploy betSite-db:01.init to pg

BEGIN;

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    role VARCHAR(20) CHECK (role IN ('user', 'modo', 'admin')) DEFAULT 'user',
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT 'default.png',
    avatar_background VARCHAR(7) DEFAULT '#00000',
    neekos NUMERIC(10,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE friends (
    id_user1 INT REFERENCES users(id_user) ON DELETE CASCADE,
    id_user2 INT REFERENCES users(id_user) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepting', 'blocked')) DEFAULT 'pending',
    PRIMARY KEY (id_user1, id_user2)
);

CREATE TABLE leagues (
    id_league SERIAL PRIMARY KEY,
    name_league VARCHAR(100) UNIQUE NOT NULL,
    complete_name VARCHAR(200)
);

CREATE TABLE championship (
    id_championship SERIAL PRIMARY KEY,
    name_championship VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE teams (
    id_team SERIAL PRIMARY KEY,
    name_team VARCHAR(100) UNIQUE NOT NULL,
    id_league INT REFERENCES leagues(id_league) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    disbanded_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE players (
    id_player SERIAL PRIMARY KEY,
    name_player VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN('TOP', 'JUNGLE', 'MID', 'ADC', 'SUP')),
    nationality VARCHAR(100),
    photo_player TEXT
);

CREATE TABLE player_team_history (
    id_player INT REFERENCES players(id_player) ON DELETE CASCADE,
    id_team INT REFERENCES teams(id_team) ON DELETE CASCADE,
    start_date date,
    end_date date DEFAULT NULL,
    PRIMARY KEY (id_player, id_team, start_date)
);

CREATE TABLE matches (
    id_match SERIAL PRIMARY KEY,
    date_match TIMESTAMP,
    team1 INT REFERENCES teams(id_team) ON DELETE CASCADE,
    team2 INT REFERENCES teams(id_team) ON DELETE CASCADE,
    victoire INT REFERENCES teams(id_team) ON DELETE CASCADE, 
    id_league INT REFERENCES leagues(id_league) ON DELETE CASCADE,
    id_championship INT REFERENCES championship(id_championship) ON DELETE CASCADE,
    game_number INT DEFAULT 1
);

CREATE TABLE match_dragons (
    id_dragon SERIAL PRIMARY KEY,
    id_match INT REFERENCES matches(id_match) ON DELETE CASCADE, 
    element VARCHAR(20) CHECK (element IN('fire', 'water', 'cloud', 'chimico', 'electro', 'earth', 'ancestral')) NOT NULL,
    id_team INT REFERENCES teams(id_team) ON DELETE CASCADE,
    time_taken TIMESTAMP
);

CREATE TABLE games (
    id_game SERIAL PRIMARY KEY,
    bo INT DEFAULT 1,
    winner_team INT REFERENCES teams(id_team) ON DELETE CASCADE
);

CREATE TABLE game_matches (
    id_game INT REFERENCES games(id_game) ON DELETE CASCADE,
    id_match INT REFERENCES matches(id_match) ON DELETE CASCADE,
    PRIMARY KEY (id_game, id_match)
);

CREATE TABLE champions (
    id_champion SERIAL PRIMARY KEY,
    name_champion VARCHAR(20) UNIQUE NOT NULL,
    image TEXT
);

CREATE TABLE players_stats (
    id_stat SERIAL PRIMARY KEY,
    id_match INT REFERENCES matches(id_match) ON DELETE CASCADE,
    id_player INT REFERENCES players(id_player) ON DELETE CASCADE,
    id_team INT REFERENCES teams(id_team) ON DELETE CASCADE,
    id_champion INT REFERENCES champions(id_champion) ON DELETE CASCADE,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    assists INT DEFAULT 0,
    gold_earned INT DEFAULT 0,
    cs INT DEFAULT 0,
    vision_score INT DEFAULT 0
);

CREATE TABLE bets (
    id_bet SERIAL PRIMARY KEY,
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
    id_game INT REFERENCES games(id_game) ON DELETE CASCADE,
    id_team INT REFERENCES teams(id_team) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('pending', 'won', 'lost')) DEFAULT 'pending',
    payout NUMERIC(10,2)
);

CREATE TABLE odds (
    id_odds SERIAL PRIMARY KEY,
    id_game INT REFERENCES games(id_game) ON DELETE CASCADE,
    id_team INT REFERENCES teams(id_team) ON DELETE CASCADE,
    odds NUMERIC(5,2) NOT NULL
);

COMMIT;
