
|Table	|Connexions|
|----|----|
|users|	🔗 bets (un utilisateur peut parier) 🔗 friends (relations entre utilisateurs)
|friends|	🔗 users (relation entre deux utilisateurs)
|teams|	🔗 matches (deux équipes jouent) 🔗 games (chaque game a un vainqueur) 🔗 players (chaque joueur appartient à une équipe)
|players|	🔗 teams (chaque joueur est dans une équipe) 🔗 player_stats (chaque joueur a des stats par game)
|leagues|	🔗 matches (chaque match appartient à une ligue)
|matches|	🔗 teams (deux équipes jouent) 🔗 leagues (appartient à une ligue) 🔗 games (BO3, BO5...) 🔗 bets (matchs sur lesquels on peut parier)
|games|	🔗 matches (chaque game appartient à un match) 🔗 teams (chaque game a un vainqueur) 🔗 player_stats (stocke les stats des joueurs pour chaque game)
|player_stats|	🔗 players (chaque joueur a des stats) 🔗 games (chaque game a des joueurs)
|bets|	🔗 users (qui a parié) 🔗 matches (sur quel match) 🔗 teams (sur quelle équipe)
|champions| 🔗 players_stats