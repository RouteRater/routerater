@pathzoom10: 0.5;
@pathzoom11: 0.85;
@pathzoom12: 1.25;
@pathzoom13: 1.5;
@pathzoom14: 2.5;
@pathzoom15: 4;
@pathzoom16: 4;
@pathzoom17: 4;

@roadwidth_motorway: 2.5;
@roadwidth_trunk: 2;
@roadwidth_primary: 1.5;
@roadwidth_residential: 1;
@roadwidth_path: 0.5;
@roadwidth_cycle: 0.85;

@opacity10: 0.33;
@opacity11: 0.66;
@bridgegap: 4;

#LCC {
  [TYPE='Local Network existing'],
  [TYPE='Main Radial Routes complete'] {
    line-color: @official;
    line-width: 0;
    [zoom=10] { line-width: @roadwidth_primary*@pathzoom10 + 2; line-opacity: @opacity10; }
    [zoom=11] { line-width: @roadwidth_primary*@pathzoom11 + 2; line-opacity: @opacity11; }
    [zoom=12] { line-width: @roadwidth_primary*@pathzoom12 + 2; }
    [zoom=13] { line-width: @roadwidth_primary*@pathzoom13 + 2; }
    [zoom=14] { line-width: @roadwidth_primary*@pathzoom14 + 2; }
    [zoom=15] { line-width: @roadwidth_primary*@pathzoom15 + 2; }
    [zoom=16] { line-width: @roadwidth_primary*@pathzoom16 + 2; }
    [zoom=17] { line-width: @roadwidth_primary*@pathzoom17 + 2; }
    [zoom>17] { line-width: @roadwidth_primary*@pathzoom17 + 2; }
  }
}


#osmroads {
  // -- line style --
  line-cap: round;
  line-join: round;
  line-smooth: 0.45;
  line-width:0;
  line-color: darken(@unrated,15);
  [grade_cycle=1] {
    line-color: darken(@beginner,15);  
  }
  [grade_cycle=2] {
    line-color: darken(@intermediate,15);  
  }
  [grade_cycle=3] {
    line-color: darken(@advanced,15);  
  }
  [grade_cycle=4] {
    line-color: darken(@extreme,15);  
  }

  [tunnel=1] {
    line-cap:butt;
    line-dasharray:6,3;
  }

  [zoom>=15] {
    ::inside {
      line-smooth:0.45;
      line-cap:square;
    }  
  }
}


#osmroads::fill {
  // -- line style --
  line-cap: round;
  line-join: round;
  line-width:0;
  line-smooth: 0.45;
  line-color: @unrated;
  line-opacity: 1;
  [grade_cycle=1] {
    line-color: @beginner;  
  }
  [grade_cycle=2] {
    line-color: @intermediate;  
  }
  [grade_cycle=3] {
    line-color: @advanced;  
  }
  [grade_cycle=4] {
    line-color: @extreme;  
  }

  // -- widths --
  [type='service'],
  [type='pedestrian'],
  [type='path'],
  [type='footway'],
  [type='steps'] {
    [zoom=13] { line-width: @roadwidth_path*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_path*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_path*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_path*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_path*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_path*@pathzoom17; }
  }
  [type='motorway_link'],
  [type='trunk_link'],
  [type='primary_link'],
  [type='secondary_link'],
  [type='tertiary'],
  [type='tertiary_link'],
  [type='unclassified'],
  [type='residential'],
  [type='living_street'] {
    [zoom=10] { line-width: @roadwidth_residential*@pathzoom10; line-opacity: @opacity10; }
    [zoom=11] { line-width: @roadwidth_residential*@pathzoom11; line-opacity: @opacity11; }
    [zoom=12] { line-width: @roadwidth_residential*@pathzoom12; }
    [zoom=13] { line-width: @roadwidth_residential*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_residential*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_residential*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_residential*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_residential*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_residential*@pathzoom17; }
  }
  [type='primary'],
  [type='secondary'] {
    [zoom=10] { line-width: @roadwidth_primary*@pathzoom10; line-opacity: @opacity10; }
    [zoom=11] { line-width: @roadwidth_primary*@pathzoom11; line-opacity: @opacity11; }
    [zoom=12] { line-width: @roadwidth_primary*@pathzoom12; }
    [zoom=13] { line-width: @roadwidth_primary*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_primary*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_primary*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_primary*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_primary*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_primary*@pathzoom17; }
  }
  [type='trunk'] {
    [zoom<=9] { line-width: @roadwidth_trunk*@pathzoom10; }
    [zoom=10] { line-width: @roadwidth_trunk*@pathzoom10; }
    [zoom=11] { line-width: @roadwidth_trunk*@pathzoom11; }
    [zoom=12] { line-width: @roadwidth_trunk*@pathzoom12; }
    [zoom=13] { line-width: @roadwidth_trunk*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_trunk*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_trunk*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_trunk*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_trunk*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_trunk*@pathzoom17; }
  }
  [type='motorway'] {
    [zoom<=9] { line-width: @roadwidth_motorway*@pathzoom10; }
    [zoom=10] { line-width: @roadwidth_motorway*@pathzoom10; }
    [zoom=11] { line-width: @roadwidth_motorway*@pathzoom11; }
    [zoom=12] { line-width: @roadwidth_motorway*@pathzoom12; }
    [zoom=13] { line-width: @roadwidth_motorway*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_motorway*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_motorway*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_motorway*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_motorway*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_motorway*@pathzoom17; }
  }
  [grade_cycle=1] {
    [zoom=10] { line-width: @roadwidth_cycle*@pathzoom10; line-opacity: @opacity10; }
    [zoom=11] { line-width: @roadwidth_cycle*@pathzoom11; line-opacity: @opacity11; }
    [zoom=12] { line-width: @roadwidth_cycle*@pathzoom12; }
    [zoom=13] { line-width: @roadwidth_cycle*@pathzoom13; }
    [zoom=14] { line-width: @roadwidth_cycle*@pathzoom14; }
    [zoom=15] { line-width: @roadwidth_cycle*@pathzoom15; }
    [zoom=16] { line-width: @roadwidth_cycle*@pathzoom16; }
    [zoom=17] { line-width: @roadwidth_cycle*@pathzoom17; }
    [zoom>17] { line-width: @roadwidth_cycle*@pathzoom17; }
  }
}

/* ---- ONE WAY ARROWS ---- */
#osmroads::oneway_arrow[zoom>15][oneway=1] {
  marker-file:url("shape://arrow");
  marker-width:15;
  marker-placement:line;
  marker-line-width:1;
  marker-line-opacity:0.5;
  marker-line-color:#ffffff;
  marker-spacing: 200;
  marker-fill:spin(darken(@unrated,50),-10);
  marker-opacity:0.8;
}

/* ---- Railways --- */
#osmroads [type='rail'] {
  line-color: @rail;

  ::line, ::hatch {
    line-color: @rail;
    [zoom=11] { line-color: lighten(@rail,10); }
    [zoom=12] { line-color: lighten(@rail,20); }
    [zoom>12] { line-color: lighten(@rail,30); }
  }
  ::line {
    line-width: 0.5;
  }
  ::fill { line-width: 0; }
  ::hatch {
    [zoom<=12] { 
      line-width: 0;
    }
    [zoom>12] {
      line-width: 4;
      line-dasharray: 1, 24;
    }
  }

}