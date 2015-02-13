# Route Rater

An idea developed at the [ODI Leeds](http://theodi.org/nodes/leeds) [#hackmyroute](https://twitter.com/search?q=%23hackmyroute&src=typd) day. 

The basic idea was to create a colour-coded map of streets using crowd sourcing. The idea developed to include a feedback mechanism where cyclists could quickly and easily report things about their route. Those things might include bad infrastructure (e.g. lamp-post in a cycle lane), busy or confusing intersections, near-misses with motor vehicles, as well as positive things like cycle-friendly cafes or pubs.


## Colour-coded routes

We want to provide a map of someone's area showing them which bits are easier and which they might want to avoid and let the users contribute their own feedback that helps update the map. Taking inspiration from European ski-route grades, we came up with:

* Green (Beginner): Off-road/separate to vehicles/gentle gradients
* Blue (Intermediate): Some or limited experience. Residential roads/low traffic/slow speeds.
* Red (Hard): Busy roads/heavy traffic/filter lanes/big roundabouts/traffic lights
* Black (Extreme): Multi-lane sections/gyratories/lots of experience and luck



## Points

A mechanism for people to record feedback about specific points in space (longitude/latitude). They could use an app (perhaps through an interface to an existing app such as [CycleStreets](http://www.cyclestreets.net/)) or report points via their computer. We want to present a simple interface that gives people a basic decision tree to make the process quick and painless. We could also let power users report things from a bigger list of items.

We need a starting list of things to record and a decision tree for things we think are the most common.

* Accident
  * Near-miss
  * Collision

## Lines

The harder problem is to get a rating for segments of road. These ratings should be based on an aggregate of all user input but also needs to be able to change with time if, say, a road or path is closed or if a problem gets fixed. Problems:


## Problems

### How do we tie people's ratings to map data?

We don't know what is best. User data (GPS tracks) will cover lots of possible routes, of varying length, encompass different classes of route along them and will have a level of inaccuracy. How do we catch useful data without forcing every user to input incredible amounts of detail? We will need to split a user's GPS track up into individual segments and attach the rating to those line segments that are purely based on the user-provided longitude/latitude. We could create a heat-map based on a weighting of all user data. Perhaps the weighting of users could depend on how specific they've been i.e. if they just rate their entire route with one grade they get a low weight but a higher weight if they've specifically marked a segment. We would want the specific ratings to win in the final output over 'general' ratings. General ratings would be a good fall-back.

## Uses

Basic output would be a map with pins showing reported points and a heatmap showing what the aggregate colour is everywhere. More advanced output would be to snap this aggregate data to roads and create a map layer using OpenStreetMap to show the colour grading. 

We would provide an API to let people query the data (not the personally identifying tracks). This could then be used by, say, [CycleStreets](http://www.cyclestreets.net/) to provide alternative routing options based on maximising a green route. They would also be able to say what fraction of their suggested route was each type of grading.

Local authorities would be able to find out what cyclists actually think, and see problem areas that they may not know about. They'd then have the data to help fix those problems.

Near-miss data would be a data set that doesn't currently exist. It might identify problem areas if lots of cyclists are having near-miss problems in the same place.

## Data

We'd like the data to be accessible through an API. Obviously there will be a cost to hosting the site and processing the ever increasing amount of data. Perhaps Local Authorities could pay an annual fee to get reporting summary tools.