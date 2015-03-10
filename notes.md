# Stuart's Notes

These are my ramblings and notes as I try to make Route Rater. They may not make sense. They are mostly here so I know what I did.

# Mapping

I got a [MetroExtract of Open Street Map](https://mapzen.com/metro-extracts) for Leeds as [IMPOSM GEOJSON](https://s3.amazonaws.com/metro-extracts.mapzen.com/leeds_england.imposm-geojson.zip). This is stored in backend/leeds_england.imposm-geojson.

The tiles are generated in [TileMill](https://www.mapbox.com/tilemill/) which is free from MapBox. This uses CSS-style style files to create a custom map. It saves as a MapBox tile file `.mbtiles`. To convert that into image tiles we need mb-util:

1. Clone MButil `git clone git://github.com/mapbox/mbutil.git`
1. Install MButil `sudo python setup.py install`
1. Use it to convert a .mbtiles file into tiles using `mb-util filename.mbtiles tiles/`

## Leeds City Council Cycle Routes

The [Leeds Data Mill](http://leedsdatamill.org/) contains [Leeds City Council cycle route data](http://leedsdatamill.org/dataset/cycle-routes-in-leeds/resource/8a09a634-d190-4ea0-8b50-6983eedca7ee). This is the GIS data behind [the maps listed on the LCC website](http://www.leeds.gov.uk/residents/Pages/Cycling-in-Leeds.aspx) (under "Documents"). These data are Shape files so need to be converted to something a bit more parseable for our purposes. Time to use GDAL. Mike Bostock has [a good tutorial on installing](http://bost.ocks.org/mike/map/).

### [GDAL](http://www.gdal.org/) installation
I installed Homebrew 
`ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
and then used that to install GDAL 
`brew install gdal`
It takes a while to install.

# Moment Databases

One containing:

Moment ID,Longitude,Latitude,Timestamp,Type (e.g. cafe/bad junction),Rating (happy/unhappy),Deleted

A second containing:
Moment ID,Username (could be IP address),Keep notified

Third with:
Username,email,other stuff

Extra Moments:
Tram lines in direction of travel
Gates
Narrow/Pinch points
Canal towpath with cobbles.
Underpass/subway
Speed bump/traffic calming measures
Cycle-path obstructed with junk/rubbish/overgrown foliage
