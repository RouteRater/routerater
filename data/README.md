# Mapping

I got a [MetroExtract of Open Street Map](https://mapzen.com/metro-extracts) for Leeds as [IMPOSM GEOJSON](https://s3.amazonaws.com/metro-extracts.mapzen.com/leeds_england.imposm-geojson.zip).

The tiles are generated in [TileMill](https://www.mapbox.com/tilemill/) which is free software from MapBox. This uses CSS-style style files to create a custom map. It saves as a MapBox tile file `.mbtiles`. To convert that into image tiles we need mb-util:

1. Clone MButil `git clone git://github.com/mapbox/mbutil.git`
1. Install MButil `sudo python setup.py install`
1. Use it to convert a .mbtiles file into tiles using `mb-util filename.mbtiles tiles/`

## Leeds City Council Cycle Routes

The [Leeds Data Mill](http://leedsdatamill.org/) provides [Leeds City Council cycle route data](http://leedsdatamill.org/dataset/cycle-routes-in-leeds/resource/8a09a634-d190-4ea0-8b50-6983eedca7ee). This is the GIS data behind [the maps listed on the LCC website](http://www.leeds.gov.uk/residents/Pages/Cycling-in-Leeds.aspx) (under "Documents"). These are Shape files so need to be converted to something a bit more parseable for our purposes. Mike Bostock has [a good tutorial on installing GDAL](http://bost.ocks.org/mike/map/).

### [GDAL](http://www.gdal.org/) installation
I installed Homebrew 

  ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

and then used that to install GDAL 

  brew install gdal

It takes a while to install.


First I converted the LCC Shapefile to the WGS84 projection system (normal longitude/latitude rather than Ordnance Survey's Eastings/Northings) using:

  ogr2ogr -t_srs "EPSG:4326" cycle-routes/PLAN_CYCLE_ROUTES_reprojected.shp cycle-routes/PLAN_CYCLE_ROUTES.shp

Next I created a GeoJSON file from that:

  ogr2ogr -t_srs EPSG:4326 -f GeoJSON -lco COORDINATE_PRECISION=7 lcc_reproject.geojson cycle-routes/PLAN_CYCLE_ROUTES_reprojected.shp

