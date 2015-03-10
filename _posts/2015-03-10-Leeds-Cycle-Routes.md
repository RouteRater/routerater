---
layout: post
title: Leeds Cycle Routes
---

In making _Route Rater_ we've trying to make use data provided by the [Leeds Data Mill](http://leedsdatamill.org/). They provide [cycle routes in Leeds](http://leedsdatamill.org/dataset/cycle-routes-in-leeds/) and [road traffic accident data](http://leedsdatamill.org/dataset/road-traffic-accidents). The first of those seems to be the data behind [the maps listed on the Leeds City Council's website](http://www.leeds.gov.uk/residents/Pages/Cycling-in-Leeds.aspx) (see under "Documents"). Once you've downloaded and unzipped [the data](http://www.leedsdatamill.org/storage/f/2015-01-19T13%3A58%3A07.136Z/cycle-routes.zip) you'll find a directory with four separate files all with the same name but different extensions. These are Shape files (`.shp`) which is fine if you are a geographic information systems (GIS) expert but I'm not. So I needed to convert them into something I could reuse more easily: GeoJSON.

There is an increasing amount of open source software for dealing with geographic data. One is named [GDAL](http://www.gdal.org/). There are a variety of [binaries available for Linux, MacOSX and Windows](http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries) but I found my operating system is too old to install those. In the end I followed [a good tutorial on installation of GDAL](http://bost.ocks.org/mike/map/) using Ruby and Homebrew which boiled down to:

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    brew install gdal

It takes a while.

With the appropriate software installed, it was time to convert this into a GeoJSON file using the command line tool `ogr2ogr` that is part of GDAL. The first time I did this I ended up with crazy results. All the longitudes and latitudes were huge numbers that were not in the range 0-360 degrees (or 0-180). It turns out that the Leeds City Council shapefiles are stored in an Ordnance Survey map projection that uses Eastings and Northings on the UK grid. After a bit of searching I discovered that `ogr2ogr` can convert this into the more common WGS84 projection (normal longitudes and latitudes) by using the flag `-t_srs "EPSG:4326"`:

    ogr2ogr -t_srs "EPSG:4326" PLAN_CYCLE_ROUTES_reprojected.shp PLAN_CYCLE_ROUTES.shp

Note that the input file is second and the output file is first. Next I created a GeoJSON file from that:

    ogr2ogr -t_srs EPSG:4326 -f GeoJSON -lco COORDINATE_PRECISION=7 lcc.geojson PLAN_CYCLE_ROUTES_reprojected.shp

A nice feature of [Github](http://github.com/) (where our project is hosted) is that [it can display the resulting GeoJSON files](https://github.com/slowe/routerater/blob/master/data/lcc.geojson) without us needing to do anything else.

![routerater]({{ site.baseurl }}/assets/leeds-cycle-routes-section.png)