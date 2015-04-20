
/* ---- HIGHWAY ---- */

#osmroadlabels {
  text-face-name:@font_reg;
  text-halo-radius:1.25;
  text-placement:line;
  text-name:"''";
  [grade_cycle=1][zoom>=12] {
    text-name:"[name]";
    text-fill:spin(darken(@beginner,50),-15);
    text-halo-fill: #ffffff;
    [zoom>=13] { text-size:11; }
    [zoom>=15] { text-size:12; }
  }
  [grade_cycle=3][zoom>=14] {
    text-name:"[name]";
    text-fill:spin(darken(@advanced,50),-15);
    text-halo-fill: #ffffff;
    [zoom>=15] { text-size:11; }
  }
  [grade_cycle=2][zoom>=15] {
    text-name:"[name]";
    text-fill:spin(darken(@intermediate,50),-15);
    text-halo-fill: #ffffff;
  }
}

/* ---- LOCATION ---- */


#countries[zoom>2][zoom<6] {
  text-name:"[NAME]";
  text-face-name:@font_reg;
  text-transform:uppercase;
  text-character-spacing:1;
  text-line-spacing:4;
  text-size:14;
  text-wrap-width:120;
  text-allow-overlap:true;
  text-halo-radius:2;
  text-halo-fill:rgba(255,255,255,0.8);
}

#cities[SCALERANK<4][zoom>2],
#cities[SCALERANK=4][zoom>3],
#cities[SCALERANK=5][zoom>4],
#cities[SCALERANK>=6][zoom>5] {
  text-name:"[NAME]";
  text-face-name:@font_reg;
  text-transform:uppercase;
  text-size:12;
  text-halo-radius:2;
  text-halo-fill:rgba(255,255,255,0.8);
}

#cities[SCALERANK=12][zoom=12] {
  text-face-name:@font_reg;
  text-name:"[NAME]";
  text-fill: @line;
  text-halo-fill:rgba(255,255,255,0.8);
  text-halo-radius:2;
  text-transform:uppercase;
  [zoom=11] {
    text-size:12;
    text-character-spacing:2;
  }
  [zoom=12] {
    text-size:14;
    text-character-spacing:4;
  }
  [zoom=13] {
    text-size:16;
    text-character-spacing:8;
  }
}
