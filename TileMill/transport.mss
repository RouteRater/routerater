.places[type='station'][zoom >=10],.places[type='train_station'][zoom >=10] {
  marker-file: url('images/rail_uk.svg');
  marker-width: 10;
  [zoom <= 12] { marker-width: 8; }
  [zoom <= 10] { marker-width: 6; }
  [zoom <= 8] { marker-width: 4; }
  [zoom<=7] { marker-width:2; }
  marker-fill: @red;
  marker-line-color: @white;
  marker-line-width: 2;

  [zoom >= 12] { marker-line-width:2;}
  [zoom >= 12] {
    marker-allow-overlap: false;
    marker-ignore-placement: false;
  }
  ::label[zoom >= 13] {
    text-face-name: @font_reg;
    text-name: '[name]';
    text-placement-type:simple;
    text-placements: "E,NE,SE,S,N,W,11,10,9";
    text-fill: @black;
    text-halo-fill: @white;
    text-halo-radius:2;
    text-size:11;
    text-dx: 6;
  }
}