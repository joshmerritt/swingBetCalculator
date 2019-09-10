



# Swing Bet Project Plan #

### Goal ###
Create a calculator that allows a user to enter a round of scores for the golf betting game “Swing Bet”

### Overview ###

Build an app that is accessible via the internet which allows for a calculation of the result of a golf game “Swing Bet.” For the given course, users can enter hole by hole scores for any number of players, two of which are designated “Swingers.” The app then creates every possible two player combination of non-swingers and calculates their score versus the swingers. The final scores are displayed, with hole-by-hole by team breakdowns, and the end total is calculated for each player. The default is $1 bet, but different ‘per stroke’ amount can be specified. 
Scoring Rules
The team with the lowest handicap-adjusted score is awarded 1 point for winning a hole, regardless of the score they won with.
If any of the players on a team make a score of less than par (a natural score, not handicap adjusted), that team is awarded 1 point for each stroke under par a player on that team scores, regardless if they win the hole or not. (birdie=1 point, eagle=2 points, albatross=3 points) 
Note: If a player is “stroking” (receiving a reduction in score based on handicap) that player can only get the points for his natural score BUT the handicap stroke can allow the player to win or tie the hole.

### Requirements ###
- Accepts golf course layout, including par and hole handicap ratings
- Accepts a player with a handicap
- Accepts any number of players
- Accepts hole by hole scores for each player
- Indicates which players are the “Swingers”
- Creates teams for each permutation of non-swinger players
- Calculates a score for each team (as defined in 6) versus the swingers for each hole
- Calculates running total
- Displays hole by hole scoring for every matchup
- Saves records of the rounds
- Landing page with links to enter a new scorecard and see previous scorecards

### Nice to haves ###
- Stores a player and default handicap
- Login
- Metrics for player average and ytd winning$

