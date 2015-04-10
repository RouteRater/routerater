@green: #2ba02c;
@blue: #3366dd;
@red: #f04031;
@yellow: #fee57f;
@black: #000000;
@white: #ffffff;
@background:#f0fff0;

@extreme:  @black;
@advanced: lighten(@red,15);
@intermediate: lighten(@blue,20);
@beginner: lighten(@green,10);
@unrated: @white;
@rail: lighten(@black,10);
@official: @yellow;
//@official: b077a2;
@water: lighten(@blue,38);//dee8ff;
@line: lighten(@black,10);
@park: @green;
@font_reg: "Ubuntu Regular","Arial Regular","DejaVu Sans Book";


Map {
  background-color:lighten(@water,10%);
}

#countries {
  ::outline {
    line-color: darken(@water,10);
    line-width: 2;
    line-join: round;
  }
  polygon-fill: @background;
}

#landusages[zoom>6] {
  [type='forest'],
  [type='wood'] {
    polygon-fill:@park;
    polygon-pattern-file:url(images/wood.png);
    polygon-pattern-comp-op:multiply;
    opacity: 0.15;
  }
  [type='cemetery'],
  [type='common'],
  [type='golf_course'],
  [type='park'],
  [type='pitch'],
  [type='recreation_ground'],
  [type='village_green'] {
    polygon-fill:@park;
    opacity: 0.15;
  }
}


#water_areas {
	polygon-fill: @water;  
}

#waterway {
  line-width:1;
  line-smooth:1;
  line-color:@water;
}
#waterway [zoom>15]{
  line-width: 5;
}
#waterway [zoom>14]{
  line-width: 4;
}
#waterway [zoom>13]{
  line-width: 3;
}
#waterway [zoom>11]{
  line-width: 2;
}
#waterway [zoom<=9]{
  line-width: 0.5;
}